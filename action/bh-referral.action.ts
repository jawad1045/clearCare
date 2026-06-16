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
    createNotification({
      userId: opts.userId,
      title: "Referral Submitted",
      message: `Your referral for ${opts.patientName} (#${opts.referralId}) has been submitted and is pending review.`,
      type: "referral_submitted",
      link: opts.userViewPath,
    }),
    ...admins.map((admin) =>
      createNotification({
        userId: admin.id,
        title: "New Referral Received",
        message: `${opts.userName} submitted a referral for ${opts.patientName} (#${opts.referralId}).`,
        type: "referral_submitted",
        link: opts.adminViewPath,
      })
    ),
    sendReferralSubmittedToUser({
      toEmail: opts.userEmail,
      toName: opts.userName,
      patientName: opts.patientName,
      referralId: opts.referralId,
      serviceType: opts.serviceType,
      viewUrl: `${APP_URL}${opts.userViewPath}`,
    }),
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
  ]);
}

export async function getBHReferralsCount() {
  return prisma.referral.count({
    where: { serviceType: "Behavioral Health" },
  });
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

  const uploadedFiles = formData.getAll("attachments") as string[];

  if (uploadedFiles.length > 5) {
    throw new Error("Maximum 5 files allowed");
  }

  const contactMethods = formData.getAll("contactMethod") as string[];

  if (!user.acctId) {
    throw new Error("No company associated with this account.");
  }

  const bhReferral = await prisma.referral.create({
    data: {
      userId: user.id,
      companyAcctId: user.acctId,
      serviceType: (formData.get("serviceType") as string) || "Behavioral Health",
      type: formData.get("type") as string,
      priority: formData.get("priority") as string,
      patientFirstName: formData.get("patientFirstName") as string,
      patientLastName: formData.get("patientLastName") as string,
      gender: formData.get("gender") as string,
      dob: new Date(formData.get("dob") as string),
      grade: (formData.get("grade") as string) || "N/A",
      race: (formData.get("race") as string) || "N/A",
      ssn: formData.get("ssn") as string,
      parentFirstName: (formData.get("parentFirstName") as string) || "",
      parentLastName: (formData.get("parentLastName") as string) || "",
      parentEmail: (formData.get("parentEmail") as string) || "",
      parentPhone: (formData.get("parentPhone") as string) || "",
      referName: (formData.get("referrerName") as string) || `${user.contactFirstName} ${user.contactLastName}`,
      notes: formData.get("notes") as string,
      datePatientContact: formData.get("contactDate")
        ? new Date(formData.get("contactDate") as string)
        : null,
      methodOfContact: contactMethods.length > 0 ? contactMethods.join(", ") : null,
      clientAttachments: uploadedFiles,
    },
  });

  const patientName = `${bhReferral.patientFirstName} ${bhReferral.patientLastName}`;
  const userName = `${user.contactFirstName} ${user.contactLastName}`;

  await notifySubmission({
    userId: user.id,
    userEmail: user.contactEmail,
    userName,
    referralId: bhReferral.id,
    patientName,
    serviceType: "Behavioral Health",
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

export async function getBHReferrals() {
  return prisma.referral.findMany({
    where: { serviceType: "Behavioral Health" },
    include: { user: true, company: true },
    orderBy: { dateOfReferral: "desc" },
  });
}

export async function getMyBHReferrals() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  return prisma.referral.findMany({
    where: {
      userId: currentUser.id,
      serviceType: "Behavioral Health",
    },
    include: { company: true },
    orderBy: { dateOfReferral: "desc" },
  });
}

export async function getBHReferralById(id: number) {
  return prisma.referral.findUnique({
    where: { id },
    include: { user: true, company: true },
  });
}

export async function updateBHReferralStatus(referralId: number, status: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "Admin") {
    throw new Error("Unauthorized: only admins can change referral status");
  }

  const updated = await prisma.referral.update({
    where: { id: referralId },
    data: { status },
  });

  await notifyStatusChange({
    referralId,
    newStatus: status,
    patientName: `${updated.patientFirstName} ${updated.patientLastName}`,
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

  const rows = await prisma.referral.groupBy({
    by: ["status"],
    where: {
      serviceType: "Behavioral Health",
      ...(month ? { dateOfReferral: dateFilter } : {}),
    },
    _count: { status: true },
  });
  return rows.map((r) => ({ status: r.status, count: r._count.status }));
}

export async function getMyBHReferralStatusCounts() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  const rows = await prisma.referral.groupBy({
    by: ["status"],
    where: { userId: currentUser.id, serviceType: "Behavioral Health" },
    _count: { status: true },
  });
  return rows.map((r) => ({ status: r.status, count: r._count.status }));
}

export async function updateBHReferralResult(referralId: number, pdfUrl: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "Admin") {
    throw new Error("Unauthorized: only admins can upload results");
  }

  const referral = await prisma.referral.update({
    where: { id: referralId },
    data: { pdfResult: pdfUrl },
    include: { user: true },
  });

  const patientName = `${referral.patientFirstName} ${referral.patientLastName}`;
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
  ]);

  revalidatePath(`/admin/bhreferrals/${referralId}`);
  revalidatePath(`/user/bhreferrals/${referralId}`);
}
