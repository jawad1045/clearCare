"use server"

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";
const SERVICE_TYPE = "Behavioral Health";

async function getAdmins() {
  return prisma.user.findMany({ where: { userRole: "Admin" } });
}

async function notifySubmission(opts: {
  userId: number;
  userEmail: string;
  userName: string;
  referralId: number;
  patientName: string;
  userViewPath: string;
  adminViewPath: string;
}) {
  const admins = await getAdmins();

  await Promise.allSettled([
    createNotification({
      userId: opts.userId,
      title: "Referral Submitted",
      message: `Your behavioral health referral for ${opts.patientName} (#${opts.referralId}) has been submitted and is pending review.`,
      type: "referral_submitted",
      link: opts.userViewPath,
    }),
    ...admins.map((admin) =>
      createNotification({
        userId: admin.id,
        title: "New Referral Received",
        message: `${opts.userName} submitted a behavioral health referral for ${opts.patientName} (#${opts.referralId}).`,
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
      viewUrl: `${APP_URL}${opts.userViewPath}`,
    }),
    ...admins.map((admin) =>
      sendReferralSubmittedToAdmin({
        toEmail: admin.contactEmail,
        patientName: opts.patientName,
        submittedBy: opts.userName,
        referralId: opts.referralId,
        serviceType: SERVICE_TYPE,
        viewUrl: `${APP_URL}${opts.adminViewPath}`,
      })
    ),
    notifySlackNewReferral({
      referralId: opts.referralId,
      patientName: opts.patientName,
      submittedBy: opts.userName,
      serviceType: SERVICE_TYPE,
      viewUrl: `${APP_URL}${opts.adminViewPath}`,
    }),
  ]);
}

async function notifyStatusChange(opts: {
  referralId: number;
  newStatus: string;
  userViewPath: string;
  patientName: string;
}) {
  const referral = await prisma.mentalHealthReferral.findUnique({
    where: { id: opts.referralId },
    include: { user: true },
  });
  if (!referral) return;

  const userName = `${referral.user.contactFirstName} ${referral.user.contactLastName}`;

  await Promise.allSettled([
    createNotification({
      userId: referral.userId,
      title: "Referral Status Updated",
      message: `Your behavioral health referral for ${opts.patientName} (#${opts.referralId}) is now ${opts.newStatus}.`,
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
      viewUrl: `${APP_URL}${opts.userViewPath}`,
    }),
  ]);
}

export async function getBHReferralsCount() {
  return prisma.mentalHealthReferral.count();
}

export async function createBHReferral(formData: FormData) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.acctId) {
    throw new Error("No company associated with this account.");
  }

  const uploadedFiles = formData.getAll("attachments") as string[];

  if (uploadedFiles.length > 5) {
    throw new Error("Maximum 5 files allowed");
  }

  const last4SSN = (formData.get("last4SSN") as string) ?? "";
  if (last4SSN.length !== 4) {
    throw new Error("You can only enter the last 4 digits of the SSN");
  }

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
      referName: (formData.get("referrerName") as string) || `${user.contactFirstName} ${user.contactLastName}`,
      notes: (formData.get("notes") as string) || null,
      clientAttachments: uploadedFiles,
    },
  });

  const patientName = `${bhReferral.firstName} ${bhReferral.lastName}`;
  const userName = `${user.contactFirstName} ${user.contactLastName}`;

  await notifySubmission({
    userId: user.id,
    userEmail: user.contactEmail,
    userName,
    referralId: bhReferral.id,
    patientName,
    userViewPath: `/user/bhreferrals/${bhReferral.id}`,
    adminViewPath: `/admin/bhreferrals/${bhReferral.id}`,
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

export async function getBHReferrals() {
  return prisma.mentalHealthReferral.findMany({
    include: { user: true, company: true },
    orderBy: { dateOfReferral: "desc" },
  });
}

export async function getMyBHReferrals() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  return prisma.mentalHealthReferral.findMany({
    where: { userId: currentUser.id },
    include: { company: true },
    orderBy: { dateOfReferral: "desc" },
  });
}

export async function getBHReferralById(id: number) {
  return prisma.mentalHealthReferral.findUnique({
    where: { id },
    include: { user: true, company: true },
  });
}

export async function updateBHReferralStatus(referralId: number, status: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "Admin") {
    throw new Error("Unauthorized: only admins can change referral status");
  }

  const updated = await prisma.mentalHealthReferral.update({
    where: { id: referralId },
    data: { status },
  });

  await notifyStatusChange({
    referralId,
    newStatus: status,
    patientName: `${updated.firstName} ${updated.lastName}`,
    userViewPath: `/user/bhreferrals/${referralId}`,
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
    throw new Error("Unauthorized");
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
    throw new Error("Unauthorized: only admins can upload results");
  }

  const referral = await prisma.mentalHealthReferral.update({
    where: { id: referralId },
    data: { pdfReport: pdfUrl },
    include: { user: true },
  });

  const patientName = `${referral.firstName} ${referral.lastName}`;
  const userName = `${referral.user.contactFirstName} ${referral.user.contactLastName}`;
  const userViewPath = `/user/bhreferrals/${referralId}`;

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
      viewUrl: `${APP_URL}${userViewPath}`,
    }),
  ]);

  revalidatePath(`/admin/bhreferrals/${referralId}`);
  revalidatePath(`/user/bhreferrals/${referralId}`);
}
