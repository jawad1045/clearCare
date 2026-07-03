"use server"

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

async function getAdmins() {
  return prisma.user.findMany({ where: { userRole: "Admin" } });
}

async function notifySubmission(opts: {
  userId: number;
  userEmail: string;
  userName: string;
  referralId: number;
  patientName: string;
  serviceType: string;
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
      viewUrl: `${APP_URL}${opts.userViewPath}`,
    }),
    // Email: each admin
    ...admins.map((admin) =>
      sendReferralSubmittedToAdmin({
        toEmail: admin.contactEmail,
        patientName: opts.patientName,
        submittedBy: opts.userName,
        referralId: opts.referralId,
        serviceType: opts.serviceType,
        viewUrl: `${APP_URL}${opts.adminViewPath}`,
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
  userViewPath: string;
  patientName: string;
}) {
  const referral = await prisma.referral.findUnique({
    where: { id: opts.referralId },
    include: { user: true },
  });
  if (!referral) return;

  const userName = `${referral.user.contactFirstName} ${referral.user.contactLastName}`;

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
      viewUrl: `${APP_URL}${opts.userViewPath}`,
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

  const referral = await prisma.referral.create({
    data: {
      userId: user.id,

      companyAcctId: user.acctId,

      serviceType:
        formData.get(
          "serviceType"
        ) as string,

      type:
        formData.get(
          "type"
        ) as string,

      priority:
        formData.get(
          "priority"
        ) as string,

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

      grade:
        formData.get(
          "grade"
        ) as string,

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

  await notifySubmission({
    userId: user.id,
    userEmail: user.contactEmail,
    userName,
    referralId: referral.id,
    patientName,
    serviceType: referral.serviceType,
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


export async function getReferrals() {
  return prisma.referral.findMany({
    where: {
      serviceType: { not: "Behavioral Health" },
    },
    include: {
      user: true,
      company: true,
    },
    orderBy: {
      dateOfReferral: "desc",
    },
  });
}


export async function getMyReferrals() {
  const currentUser =
    await getCurrentUser();

  if (!currentUser) {
    const { t } = await getServerTranslation();
    throw new Error(t("common.errors.unauthorized"));
  }

  return prisma.referral.findMany({
    where: {
      userId: currentUser.id,
      serviceType: { not: "Behavioral Health" },
    },
    include: {
      company: true,
    },
    orderBy: {
      dateOfReferral: "desc",
    },
  });
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

  const updated = await prisma.referral.update({
    where: { id: referralId },
    data: { status },
  });

  await notifyStatusChange({
    referralId,
    newStatus: status,
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
      viewUrl: `${APP_URL}${userViewPath}`,
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

