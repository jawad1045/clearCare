"use server"

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import bcrypt from "bcryptjs";
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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";
const DRUG_TEST_SERVICE = "Drug Test";

async function getAdmins() {
  return prisma.user.findMany({ where: { userRole: "Admin" } });
}

async function notifySubmission(opts: {
  userId: number;
  userEmail: string;
  userName: string;
  companyName?: string;
  referralId: number;
  patientName: string;
  serviceType: string;
  status?: string;
  dateSubmitted?: string;
  userViewPath: string;
  adminViewPath: string;
}) {
  const admins = await getAdmins();

  await Promise.allSettled([
    // In-app: user
    createNotification({
      userId: opts.userId,
      title: "Referral Submitted",
      message: `Your referral for ${opts.patientName} (#${opts.referralId}) has been submitted and is pending review.`,
      type: "referral_submitted",
      link: opts.userViewPath,
    }),
    // In-app: each admin
    ...admins.map((admin) =>
      createNotification({
        userId: admin.id,
        title: "New Referral Received",
        message: `${opts.userName} submitted a referral for ${opts.patientName} (#${opts.referralId}).`,
        type: "referral_submitted",
        link: opts.adminViewPath,
      })
    ),
    // Email: user
    sendReferralSubmittedToUser({
      toEmail: opts.userEmail,
      toName: opts.userName,
      patientName: opts.patientName,
      referralId: opts.referralId,
      serviceType: opts.serviceType,
      companyName: opts.companyName,
      submittedBy: opts.userName,
      status: opts.status ?? "Pending",
      dateSubmitted: opts.dateSubmitted,
      // viewUrl: `${APP_URL}${opts.userViewPath}`,
    }),
    // Email: each admin
    ...admins.map((admin) =>
      sendReferralSubmittedToAdmin({
        toEmail: admin.contactEmail,
        patientName: opts.patientName,
        submittedBy: opts.userName,
        referralId: opts.referralId,
        serviceType: opts.serviceType,
        companyName: opts.companyName,
        status: opts.status ?? "Pending",
        dateSubmitted: opts.dateSubmitted,
        // viewUrl: `${APP_URL}${opts.adminViewPath}`,
      })
    ),
    // Slack
    notifySlackNewReferral({
      referralId: opts.referralId,
      patientName: opts.patientName,
      submittedBy: opts.userName,
      serviceType: opts.serviceType,
    }),
  ]);
}

async function notifyStatusChange(opts: {
  referralId: number;
  newStatus: string;
  previousStatus?: string;
  userViewPath: string;
  patientName: string;
}) {
  const referral = await prisma.referral.findUnique({
    where: { id: opts.referralId },
    include: { user: true, company: true },
  });
  if (!referral) return;

  const userName = `${referral.user.contactFirstName} ${referral.user.contactLastName}`;
  const companyName = referral.company?.organization;

  await Promise.allSettled([
    createNotification({
      userId: referral.userId,
      title: "Referral Status Updated",
      message: `Your referral for ${opts.patientName} (#${opts.referralId}) is now ${opts.newStatus}.`,
      type: "status_changed",
      link: opts.userViewPath,
    }),
    sendStatusChangedToUser({
      toEmail: referral.user.contactEmail,
      toName: userName,
      patientName: opts.patientName,
      referralId: opts.referralId,
      newStatus: opts.newStatus,
      previousStatus: opts.previousStatus,
      companyName,
      updatedDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      // viewUrl: `${APP_URL}${opts.userViewPath}`,
    }),
    notifySlackStatusChanged({
      referralId: opts.referralId,
      patientName: opts.patientName,
      newStatus: opts.newStatus,
    }),
  ]);
}


export async function createReferral(
  formData: FormData
) {
  const currentUser =
    await getCurrentUser();

  const { t } = await getServerTranslation();

  if (!currentUser) {
    throw new Error(t("common.errors.unauthorized"));
  }

  const user =
    await prisma.user.findUnique({
      where: {
        id: currentUser.id,
      },
      include: {
        company: true,
      },
    });

  if (!user) {
    throw new Error(
      t("users.userNotFound")
    );
  }

  // UploadThing URLs from hidden inputs
  const uploadedFiles =
    formData.getAll(
      "attachments"
    ) as string[];

  if (
    uploadedFiles.length > 5
  ) {
    throw new Error(
      t("referrals.errorMaxFilesAllowed")
    );
  }

  // Encrypt SSN
  const ssn =
    formData.get(
      "ssn"
    ) as string;

  const encryptedSSN =
    await bcrypt.hash(
      ssn,
      10
    );

  if (!user.acctId) {
    throw new Error(t("referrals.errorNoCompanyAssociated"));
  }

  const serviceType = formData.get("serviceType") as string;

  // type/priority/contactDate/contactMethod are only collected on the client when
  // serviceType === "Drug Test". Normalize missing/empty values to null instead of
  // persisting empty strings, and re-validate server-side since client validation
  // can't be trusted alone.
  const rawType = ((formData.get("type") as string) || "").trim();
  const rawPriority = ((formData.get("priority") as string) || "").trim();
  const rawGrade = ((formData.get("grade") as string) || "").trim();

  if (serviceType === DRUG_TEST_SERVICE) {
    if (!rawType || !rawPriority) {
      throw new Error(t("referrals.testTypeAndPriorityRequiredForDrugTest"));
    }
  }

  const referral = await prisma.referral.create({
    data: {
      userId: user.id,

      companyAcctId: user.acctId,

      serviceType,

      type: rawType || null,

      priority: rawPriority || null,

      parentFirstName:
        formData.get(
          "parentFirstName"
        ) as string,

      parentLastName:
        formData.get(
          "parentLastName"
        ) as string,

      parentEmail:
        formData.get(
          "parentEmail"
        ) as string,

      parentPhone:
        formData.get(
          "parentPhone"
        ) as string,

      patientFirstName:
        formData.get(
          "patientFirstName"
        ) as string,

      patientLastName:
        formData.get(
          "patientLastName"
        ) as string,

      dob: new Date(
        formData.get(
          "dob"
        ) as string
      ),

      grade: rawGrade || null,

      race:
        formData.get(
          "race"
        ) as string,

      gender:
        formData.get(
          "gender"
        ) as string,

      ssn: encryptedSSN,

      status:
        (formData.get("status") as string) || "Pending",

      notes:
        formData.get(
          "notes"
        ) as string,

      referName: `${user.contactFirstName} ${user.contactLastName}`,

      clientAttachments:
        uploadedFiles,
    },
  });

  const patientName = `${referral.patientFirstName} ${referral.patientLastName}`;
  const userName = `${user.contactFirstName} ${user.contactLastName}`;
  const companyName = user.company?.organization;
  const dateSubmitted = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  await notifySubmission({
    userId: user.id,
    userEmail: user.contactEmail,
    userName,
    companyName,
    referralId: referral.id,
    patientName,
    serviceType: referral.serviceType,
    status: referral.status,
    dateSubmitted,
    userViewPath: `/user/referrals/${referral.id}`,
    adminViewPath: `/admin/referrals/${referral.id}`,
  }).catch(() => {});

  revalidatePath(
    "/admin/referrals"
  );

  revalidatePath(
    "/user/referrals"
  );

  if (
    currentUser.role ===
    "Admin"
  ) {
    redirect(
      "/admin/referrals"
    );
  }

  redirect(
    "/user/referrals"
  );
}

// ---------------------------------------------------------------------------
// Pagination types shared by getReferrals / getMyReferrals
// ---------------------------------------------------------------------------

export type GetReferralsParams = {
  search?: string;
  status?: string; // "all" | actual status value
  page?: number;
  limit?: number;
};

export type PaginatedReferrals = Awaited<ReturnType<typeof getReferrals>>;

function buildReferralWhere(
  base: Prisma.ReferralWhereInput,
  { search, status }: Pick<GetReferralsParams, "search" | "status">
): Prisma.ReferralWhereInput {
  const where: Prisma.ReferralWhereInput = { ...base };

  if (status && status !== "all") {
    where.status = status;
  }

  const trimmedSearch = search?.trim();
  if (trimmedSearch) {
    where.OR = [
      { patientFirstName: { contains: trimmedSearch, mode: "insensitive" } },
      { patientLastName: { contains: trimmedSearch, mode: "insensitive" } },
      { parentFirstName: { contains: trimmedSearch, mode: "insensitive" } },
      { parentLastName: { contains: trimmedSearch, mode: "insensitive" } },
      { parentEmail: { contains: trimmedSearch, mode: "insensitive" } },
      { referName: { contains: trimmedSearch, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function getReferrals(params: GetReferralsParams = {}) {
  const { search = "", status = "all" } = params;
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.max(1, params.limit ?? 20);

  const where = buildReferralWhere(
    { serviceType: { not: "Behavioral Health" } },
    { search, status }
  );

  const [referrals, total] = await Promise.all([
    prisma.referral.findMany({
      where,
      include: {
        user: true,
        company: true,
      },
      orderBy: {
        dateOfReferral: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.referral.count({ where }),
  ]);

  return {
    referrals,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}


export async function getMyReferrals(params: GetReferralsParams = {}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    const { t } = await getServerTranslation();
    throw new Error(t("common.errors.unauthorized"));
  }

  const { search = "", status = "all" } = params;
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.max(1, params.limit ?? 20);

  const where = buildReferralWhere(
    {
      userId: currentUser.id,
      serviceType: { not: "Behavioral Health" },
    },
    { search, status }
  );

  const [referrals, total] = await Promise.all([
    prisma.referral.findMany({
      where,
      include: {
        company: true,
      },
      orderBy: {
        dateOfReferral: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.referral.count({ where }),
  ]);

  return {
    referrals,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}


export async function getReferralsCount() {
  return prisma.referral.count({
    where: { serviceType: { not: "Behavioral Health" } },
  });
}

export async function getRecentReferrals(take = 6) {
  return prisma.referral.findMany({
    take,
    orderBy: { dateOfReferral: "desc" },
    include: { company: true },
    where: { serviceType: { not: "Behavioral Health" } },
  });
}

export async function getReferralsByServiceType() {
  const rows = await prisma.referral.groupBy({
    by: ["serviceType"],
    _count: { serviceType: true },
  });
  return rows.map((r) => ({ label: r.serviceType, count: r._count.serviceType }));
}

export async function getTopCompaniesByReferrals(take = 5) {
  const rows = await prisma.referral.groupBy({
    by: ["companyAcctId"],
    _count: { companyAcctId: true },
    orderBy: { _count: { companyAcctId: "desc" } },
    take,
  });
  const ids = rows.map((r) => r.companyAcctId);
  const companies = await prisma.company.findMany({ where: { id: { in: ids } } });
  const map = Object.fromEntries(companies.map((c) => [c.id, c.organization]));
  return rows.map((r) => ({ name: map[r.companyAcctId] ?? "Unknown", count: r._count.companyAcctId }));
}

export async function updateReferralStatus(
  referralId: number,
  status: string
) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "Admin") {
    const { t } = await getServerTranslation();
    throw new Error(t("referrals.errorOnlyAdminsChangeStatus"));
  }

  const currentReferral = await prisma.referral.findUnique({
    where: { id: referralId },
    select: { status: true },
  });

  const updated = await prisma.referral.update({
    where: { id: referralId },
    data: { status },
  });

  await notifyStatusChange({
    referralId,
    newStatus: status,
    previousStatus: currentReferral?.status,
    patientName: `${updated.patientFirstName} ${updated.patientLastName}`,
    userViewPath: `/user/referrals/${referralId}`,
  }).catch(() => {});

  revalidatePath("/admin/referrals");
  revalidatePath(`/admin/referrals/${referralId}`);
  revalidatePath("/user/referrals");
}

export async function getReferralById(
  id: number
) {
  return prisma.referral.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
      company: true,
    },
  });
}

export async function getMyReferralCounts() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    const { t } = await getServerTranslation();
    throw new Error(t("common.errors.unauthorized"));
  }

  const total = await prisma.referral.count({
    where: { userId: currentUser.id, serviceType: { not: "Behavioral Health" } },
  });

  const bh = await prisma.referral.count({
    where: { userId: currentUser.id, serviceType: "Behavioral Health" },
  });

  return { total, bh };
}

export async function getReferralStatusCounts(month?: string) {
  const dateFilter: { gte?: Date; lt?: Date } = {};
  if (month) {
    const [year, mon] = month.split("-").map(Number);
    dateFilter.gte = new Date(year, mon - 1, 1);
    dateFilter.lt = new Date(year, mon, 1);
  }

  const rows = await prisma.referral.groupBy({
    by: ["status"],
    where: {
      serviceType: { not: "Behavioral Health" },
      ...(month ? { dateOfReferral: dateFilter } : {}),
    },
    _count: { status: true },
  });
  return rows.map((r) => ({ status: r.status, count: r._count.status }));
}

export async function getMyReferralStatusCounts() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    const { t } = await getServerTranslation();
    throw new Error(t("common.errors.unauthorized"));
  }

  const rows = await prisma.referral.groupBy({
    by: ["status"],
    where: { userId: currentUser.id, serviceType: { not: "Behavioral Health" } },
    _count: { status: true },
  });
  return rows.map((r) => ({ status: r.status, count: r._count.status }));
}

export async function updateReferralResult(referralId: number, pdfUrl: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "Admin") {
    const { t } = await getServerTranslation();
    throw new Error(t("referrals.errorOnlyAdminsUploadResults"));
  }

  const referral = await prisma.referral.update({
    where: { id: referralId },
    data: { pdfResult: pdfUrl },
    include: { user: true },
  });

  const patientName = `${referral.patientFirstName} ${referral.patientLastName}`;
  const userName = `${referral.user.contactFirstName} ${referral.user.contactLastName}`;
  const isBH = referral.serviceType === "Behavioral Health";
  const userViewPath = isBH
    ? `/user/bhreferrals/${referralId}`
    : `/user/referrals/${referralId}`;

  await Promise.allSettled([
    createNotification({
      userId: referral.userId,
      title: "Result Available",
      message: `The result for ${patientName} (#${referralId}) has been uploaded and is ready to download.`,
      type: "result_uploaded",
      link: userViewPath,
    }),
    sendResultUploadedToUser({
      toEmail: referral.user.contactEmail,
      toName: userName,
      patientName,
      referralId,
      // viewUrl: `${APP_URL}${userViewPath}`,
    }),
    notifySlackResultUploaded({
      referralId,
      patientName,
    }),
  ]);

  revalidatePath(`/admin/referrals/${referralId}`);
  revalidatePath(`/admin/bhreferrals/${referralId}`);
  revalidatePath(`/user/referrals/${referralId}`);
  revalidatePath(`/user/bhreferrals/${referralId}`);
}