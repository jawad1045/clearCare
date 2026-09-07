"use server";

import { prisma } from "@/lib/prisma";
import { sendPendingReferralsDigestEmail, PendingReferralDigestItem } from "@/lib/email";

declare global {
  var __lastPendingDigestSentAt: number | undefined;
  var __pendingDigestTimerInitialized: boolean | undefined;
}

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/**
 * Retrieves the current count of pending Medical and Behavioral Health referrals.
 */
export async function getPendingReferralsCounts() {
  const [medicalCount, bhCount] = await Promise.all([
    prisma.referral.count({ where: { status: "Pending" } }),
    prisma.mentalHealthReferral.count({ where: { status: "Pending" } }),
  ]);

  return {
    medicalCount,
    bhCount,
    totalPending: medicalCount + bhCount,
  };
}

/**
 * Server action to gather all remaining pending Medical and BH referrals
 * and send a 24-hour summary email to the designated recipient.
 */
export async function checkAndSendPendingReferralsDigest(targetEmailOverride?: string) {
  // 1. Fetch pending Medical referrals
  const medicalReferrals = await prisma.referral.findMany({
    where: { status: "Pending" },
    include: {
      company: {
        select: { organization: true },
      },
    },
    orderBy: { dateOfReferral: "desc" },
  });

  // 2. Fetch pending Behavioral Health referrals
  const bhReferrals = await prisma.mentalHealthReferral.findMany({
    where: { status: "Pending" },
    include: {
      company: {
        select: { organization: true },
      },
    },
    orderBy: { dateOfReferral: "desc" },
  });

  const medicalCount = medicalReferrals.length;
  const bhCount = bhReferrals.length;
  const totalPending = medicalCount + bhCount;

  // 3. Resolve target recipient email
  let recipientEmail = (targetEmailOverride || process.env.PENDING_NOTIFICATION_EMAIL || "").trim();

  if (!recipientEmail) {
    const adminUser = await prisma.user.findFirst({
      where: { userRole: "Admin", isActive: true },
      select: { contactEmail: true },
    });
    if (adminUser?.contactEmail) {
      recipientEmail = adminUser.contactEmail;
    }
  }

  if (!recipientEmail) {
    recipientEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "admin@healthworkspros.net";
  }

  // 4. Map referral items for the email digest
  const items: PendingReferralDigestItem[] = [
    ...medicalReferrals.map((r) => ({
      id: r.id,
      type: "Medical" as const,
      patientName: `${r.patientFirstName} ${r.patientLastName}`,
      companyName: r.company?.organization || "—",
      referName: r.referName || "—",
      dateOfReferral: r.dateOfReferral,
      serviceTypeOrReferralType: r.serviceType,
    })),
    ...bhReferrals.map((r) => ({
      id: r.id,
      type: "Behavioral Health" as const,
      patientName: `${r.firstName} ${r.lastName}`,
      companyName: r.company?.organization || "—",
      referName: r.referName || "—",
      dateOfReferral: r.dateOfReferral,
      serviceTypeOrReferralType: r.referralType?.join(", ") || "BH",
    })),
  ].sort((a, b) => b.dateOfReferral.getTime() - a.dateOfReferral.getTime());

  // 5. Send digest email via Resend
  await sendPendingReferralsDigestEmail({
    toEmail: recipientEmail,
    medicalCount,
    bhCount,
    totalPending,
    items,
  });

  // Record timestamp of this run
  globalThis.__lastPendingDigestSentAt = Date.now();

  return {
    success: true,
    totalPending,
    medicalCount,
    bhCount,
    sentTo: recipientEmail,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Checks if 24 hours have elapsed since the last digest email and triggers the action if due.
 */
export async function triggerPendingDigestIfDue24h() {
  const lastSent = globalThis.__lastPendingDigestSentAt || 0;
  const now = Date.now();

  if (now - lastSent >= TWENTY_FOUR_HOURS_MS) {
    return await checkAndSendPendingReferralsDigest();
  }

  return {
    success: false,
    message: "24 hours have not elapsed since the last digest email.",
    nextDueInMs: TWENTY_FOUR_HOURS_MS - (now - lastSent),
  };
}

// Initialize continuous 24h background timer in the running Node process
if (typeof window === "undefined" && !globalThis.__pendingDigestTimerInitialized) {
  globalThis.__pendingDigestTimerInitialized = true;

  // Background interval running every 24 hours
  setInterval(async () => {
    try {
      await checkAndSendPendingReferralsDigest();
    } catch (err) {
      console.error("24h automatic pending referrals digest error:", err);
    }
  }, TWENTY_FOUR_HOURS_MS);
}

