"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createNotification } from "@/action/notification.action";
import {
  sendReferralSubmittedToUser,
  sendReferralSubmittedToAdmin,
  sendStatusChangedToUser,
  sendResultUploadedToUser,
} from "@/lib/email";
import {
  notifySlackNewReferral,
  notifySlackStatusChanged,
  notifySlackResultUploaded,
} from "@/lib/slack";
import { getServerTranslation } from "@/locale/server";
import { formatDateTime } from "@/lib/format-date";

const SERVICE_TYPE = "Medical";

// Updated per Isaiah House feedback — matches BH_REFERRAL_TYPES in create-bh-referral-form.tsx
const VALID_REFERRAL_TYPES = [
  "New IOP (Battery)",
  "Psych. Evaluation (Youth)",
  "Psych. Evaluation (Adult)",
  "Individual IOP Therapy",
  "General Therapy",
  "Couples Therapy",
  "Medication Management (MAT)",
  "EAP",
  "Elder Care NOW®",
  "Neuro-Development Eval.",
  "Neurological Eval.",
] as const;

async function getAdmins() {
  return prisma.user.findMany({ where: { userRole: "Admin" } });
}

async function notifySubmission(opts: {
  userId: number;
  userEmail: string;
  userName: string;
  referralId: number;
  patientName: string;
  companyName?: string;
  userViewPath: string;
  adminViewPath: string;
  submittedAt?: string;
}) {
  const admins = await getAdmins();
  const formattedDateTime = opts.submittedAt ?? formatDateTime(new Date());

  await Promise.allSettled([
    createNotification({
      userId: opts.userId,
      title: "Referral Submitted",
      message: `Your behavioral health referral for ${opts.patientName} (#${opts.referralId}) was submitted on ${formattedDateTime} and is pending review.`,
      type: "referral_submitted",
      link: opts.userViewPath,
    }),
    ...admins.map((admin) =>
      createNotification({
        userId: admin.id,
        title: "New Referral Received",
        message: `${opts.userName}${opts.companyName ? ` (${opts.companyName})` : ""} submitted a behavioral health referral for ${opts.patientName} (#${opts.referralId}) on ${formattedDateTime}.`,
        type: "referral_submitted",
        link: opts.adminViewPath,
      })
    ),
    sendReferralSubmittedToUser({
      toEmail: opts.userEmail,
      toName: opts.userName,
      patientName: opts.patientName,
      referralId: opts.referralId,
      serviceType: SERVICE_TYPE,
      companyName: opts.companyName,
      submittedAt: formattedDateTime,
    }),
    ...admins.map((admin) =>
      sendReferralSubmittedToAdmin({
        toEmail: admin.contactEmail,
        patientName: opts.patientName,
        submittedBy: opts.userName,
        referralId: opts.referralId,
        serviceType: SERVICE_TYPE,
        companyName: opts.companyName,
        submittedAt: formattedDateTime,
      })
    ),
    notifySlackNewReferral({
      referralId: opts.referralId,
      patientName: opts.patientName,
      submittedBy: opts.userName,
      serviceType: SERVICE_TYPE,
      companyName: opts.companyName ?? "",
    }),
  ]);
}

async function notifyStatusChange(opts: {
  referralId: number;
  newStatus: string;
  userViewPath: string;
  patientName: string;
  updatedAt?: string;
}) {
  const referral = await prisma.mentalHealthReferral.findUnique({
    where: { id: opts.referralId },
    include: { 
      user: true, 
      company: true 
    },
  });
  if (!referral) return;

  const userName = `${referral.user.contactFirstName} ${referral.user.contactLastName}`;
  const companyName =
    referral.company?.organization ??
    referral.user.organization ??
    "Unknown Company";
  const formattedDateTime = opts.updatedAt ?? formatDateTime(new Date());

  await Promise.allSettled([
    createNotification({
      userId: referral.userId,
      title: "Referral Status Updated",
      message: `Your behavioral health referral for ${opts.patientName} (#${opts.referralId}) is now ${opts.newStatus} (${formattedDateTime}).`,
      type: "status_changed",
      link: opts.userViewPath,
    }),
    sendStatusChangedToUser({
      toEmail: referral.user.contactEmail,
      toName: userName,
      patientName: opts.patientName,
      referralId: opts.referralId,
      newStatus: opts.newStatus,
      companyName,
      updatedAt: formattedDateTime,
    }),
    notifySlackStatusChanged({
      referralId: opts.referralId,
      patientName: opts.patientName,
      newStatus: opts.newStatus,
      companyName,
    }),
  ]);
}

export async function getBHReferralsCount() {
  return prisma.mentalHealthReferral.count();
}

export async function createBHReferral(formData: FormData) {
  const currentUser = await getCurrentUser();
  const { t } = await getServerTranslation();

  if (!currentUser) {
    throw new Error(t("common.errors.unauthorized"));
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    include: {
      company: true,
    },
  });

  if (!user) {
    throw new Error(t("users.userNotFound"));
  }

  if (!user.acctId) {
    throw new Error(t("referrals.errorNoCompanyAssociated"));
  }

  const uploadedFiles = formData.getAll("attachments") as string[];

  if (uploadedFiles.length > 5) {
    throw new Error(t("referrals.errorMaxFilesAllowed"));
  }

  const last4SSN = (formData.get("last4SSN") as string) ?? "";
  if (last4SSN.length !== 4) {
    throw new Error(t("referrals.errorLast4SsnOnly"));
  }

  // Form now submits one or more "referralTypes" entries (checkbox multi-select)
  // instead of a single "referralType" value.
  const referralTypes = formData.getAll("referralTypes") as string[];
  if (
    referralTypes.length === 0 ||
    !referralTypes.every((rt) => VALID_REFERRAL_TYPES.includes(rt as (typeof VALID_REFERRAL_TYPES)[number]))
  ) {
    throw new Error(t("referrals.errorInvalidReferralType"));
  }

  // NOTE: the `referralType` column is a single String, so the selections are
  // stored as a comma-separated string to avoid a schema migration. If you'd
  // rather store these as a true array (e.g. a Postgres String[] column),
  // change this to `referralTypes` and update the Prisma schema + this create
  // call's field name accordingly.
  const referralType = referralTypes.join(", ");

  const grade = ((formData.get("grade") as string) || "").trim();

  const bhReferral = await prisma.mentalHealthReferral.create({
    data: {
      userId: user.id,
      companyAcctId: user.acctId,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phone: formData.get("phone") as string,
      last4SSN,
      email: (formData.get("email") as string) || null,
      gender: formData.get("gender") as string,
      grade: grade || null,
      referralType,
      referName: (formData.get("referrerName") as string) || `${user.contactFirstName} ${user.contactLastName}`,
      notes: (formData.get("notes") as string) || null,
      clientAttachments: uploadedFiles,
    },
  });

  const patientName = `${bhReferral.firstName} ${bhReferral.lastName}`;
  const userName = `${user.contactFirstName} ${user.contactLastName}`;
  
  const companyName = user.company?.organization ?? user.organization ?? "Unknown Company";
  const nowFormatted = formatDateTime(new Date());

  await notifySubmission({
    userId: user.id,
    userEmail: user.contactEmail,
    userName,
    referralId: bhReferral.id,
    patientName,
    companyName,
    userViewPath: `/user/bhreferrals/${bhReferral.id}`,
    adminViewPath: `/admin/bhreferrals/${bhReferral.id}`,
    submittedAt: nowFormatted,
  }).catch(() => {});

  revalidatePath("/admin/bhreferrals");
  revalidatePath("/user/bhreferrals");

  if (currentUser.role === "Admin") {
    redirect("/admin/bhreferrals");
  }

  redirect("/user/bhreferrals");
}

export async function getRecentBHReferrals(take = 6) {
  return prisma.mentalHealthReferral.findMany({
    take,
    include: { company: true },
    orderBy: { dateOfReferral: "desc" },
  });
}

export type GetBHReferralsParams = {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
};

export type PaginatedBHReferrals = Awaited<ReturnType<typeof getBHReferrals>>;

function buildBHReferralWhere(
  base: Prisma.MentalHealthReferralWhereInput,
  { search, status }: Pick<GetBHReferralsParams, "search" | "status">
): Prisma.MentalHealthReferralWhereInput {
  const where: Prisma.MentalHealthReferralWhereInput = { ...base };

  if (status && status !== "all") {
    where.status = status;
  }

  const trimmedSearch = search?.trim();
  if (trimmedSearch) {
    where.OR = [
      { firstName: { contains: trimmedSearch, mode: "insensitive" } },
      { lastName: { contains: trimmedSearch, mode: "insensitive" } },
      { email: { contains: trimmedSearch, mode: "insensitive" } },
      { phone: { contains: trimmedSearch, mode: "insensitive" } },
      { referName: { contains: trimmedSearch, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function getBHReferrals(params: GetBHReferralsParams = {}) {
  const { search = "", status = "all" } = params;
  const page = Math.max(1, params.page ?? 1);
  const limit = params.limit != null ? Math.max(1, params.limit) : undefined;

  const where = buildBHReferralWhere({}, { search, status });

  const [referrals, total] = await Promise.all([
    prisma.mentalHealthReferral.findMany({
      where,
      include: { user: true, company: true },
      orderBy: { dateOfReferral: "desc" },
      ...(limit != null ? { skip: (page - 1) * limit, take: limit } : {}),
    }),
    prisma.mentalHealthReferral.count({ where }),
  ]);

  return {
    referrals,
    total,
    page,
    limit: limit ?? total,
    totalPages: limit != null ? Math.max(1, Math.ceil(total / limit)) : 1,
  };
}

export async function getMyBHReferrals(params: GetBHReferralsParams = {}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    const { t } = await getServerTranslation();
    throw new Error(t("common.errors.unauthorized"));
  }

  const { search = "", status = "all" } = params;
  const page = Math.max(1, params.page ?? 1);
  const limit = params.limit != null ? Math.max(1, params.limit) : undefined;

  const where = buildBHReferralWhere(
    { userId: currentUser.id },
    { search, status }
  );

  const [referrals, total] = await Promise.all([
    prisma.mentalHealthReferral.findMany({
      where,
      include: { company: true },
      orderBy: { dateOfReferral: "desc" },
      ...(limit != null ? { skip: (page - 1) * limit, take: limit } : {}),
    }),
    prisma.mentalHealthReferral.count({ where }),
  ]);

  return {
    referrals,
    total,
    page,
    limit: limit ?? total,
    totalPages: limit != null ? Math.max(1, Math.ceil(total / limit)) : 1,
  };
}

export async function getBHReferralById(id: number) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  const referral = await prisma.mentalHealthReferral.findUnique({
    where: { id },
    include: {
      user: true,
      company: true,
      statusHistory: {
        orderBy: { id: "desc" }, // Fixed: Orders by primary key ID instead of non-existent createdAt
      },
    },
  });

  if (!referral) return null;

  // Security check: restrict non-admins to their own records
  if (currentUser.role !== "Admin" && referral.userId !== currentUser.id) {
    return null;
  }

  return referral;
}

export async function updateBHReferralStatus(referralId: number, status: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "Admin") {
    const { t } = await getServerTranslation();
    throw new Error(t("referrals.errorOnlyAdminsChangeStatus"));
  }

  const now = new Date();

  // Execute referral update and status history logging atomically
  const updated = await prisma.$transaction(async (tx) => {
    const referral = await tx.mentalHealthReferral.update({
      where: { id: referralId },
      data: { 
        status,
        lastUpdated: now,
      },
    });

    await tx.bHReferralStatusHistory.create({
      data: {
        referralId,
        status,
        changedBy: currentUser.id,
      },
    });

    return referral;
  });

  const nowFormatted = formatDateTime(now);

  await notifyStatusChange({
    referralId,
    newStatus: status,
    patientName: `${updated.firstName} ${updated.lastName}`,
    userViewPath: `/user/bhreferrals/${referralId}`,
    updatedAt: nowFormatted,
  }).catch(() => {});

  revalidatePath("/admin/bhreferrals");
  revalidatePath(`/admin/bhreferrals/${referralId}`);
  revalidatePath("/user/bhreferrals");

  if (currentUser?.role === "Admin") {
    return "/admin/bhreferrals";
  }

  return "/user/bhreferrals";
}

export async function getBHReferralStatusCounts(month?: string) {
  const dateFilter: { gte?: Date; lt?: Date } = {};
  if (month) {
    const [year, mon] = month.split("-").map(Number);
    dateFilter.gte = new Date(year, mon - 1, 1);
    dateFilter.lt = new Date(year, mon, 1);
  }

  const rows = await prisma.mentalHealthReferral.groupBy({
    by: ["status"],
    where: month ? { dateOfReferral: dateFilter } : undefined,
    _count: { status: true },
  });
  return rows.map((r) => ({ status: r.status, count: r._count.status }));
}

export async function getMyBHReferralStatusCounts() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    const { t } = await getServerTranslation();
    throw new Error(t("common.errors.unauthorized"));
  }

  const rows = await prisma.mentalHealthReferral.groupBy({
    by: ["status"],
    where: { userId: currentUser.id },
    _count: { status: true },
  });
  return rows.map((r) => ({ status: r.status, count: r._count.status }));
}

export async function updateBHReferralResult(referralId: number, pdfUrl: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "Admin") {
    const { t } = await getServerTranslation();
    throw new Error(t("referrals.errorOnlyAdminsUploadResults"));
  }

  const referral = await prisma.mentalHealthReferral.update({
    where: { id: referralId },
    data: { pdfReport: pdfUrl },
    include: { 
      user: true, 
      company: true 
    },
  });

  const patientName = `${referral.firstName} ${referral.lastName}`;
  const userName = `${referral.user.contactFirstName} ${referral.user.contactLastName}`;
  
  const companyName =
    referral.company?.organization ??
    referral.user.organization ??
    "Unknown Company";

  const userViewPath = `/user/bhreferrals/${referralId}`;
  const nowFormatted = formatDateTime(new Date());

  await Promise.allSettled([
    createNotification({
      userId: referral.userId,
      title: "Result Available",
      message: `The result for ${patientName} (#${referralId}) was uploaded on ${nowFormatted} and is ready to download.`,
      type: "result_uploaded",
      link: userViewPath,
    }),
    sendResultUploadedToUser({
      toEmail: referral.user.contactEmail,
      toName: userName,
      patientName,
      referralId,
      companyName,
      uploadedAt: nowFormatted,
    }),
    notifySlackResultUploaded({
      referralId,
      patientName,
      companyName,
    }),
  ]);

  revalidatePath(`/admin/bhreferrals/${referralId}`);
  revalidatePath(`/user/bhreferrals/${referralId}`);
}

// action/bh-referral.action.ts
export async function getBHReferralStatusHistory(referralId: number) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return [];

  const history = await prisma.bHReferralStatusHistory.findMany({
    where: { referralId },
    orderBy: { changedAt: "desc" },
    select: { id: true, status: true, changedAt: true },
  });

  return history;
}