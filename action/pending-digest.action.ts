"use server";

import { prisma } from "@/lib/prisma";
import {
  sendPendingReferralsDigestEmail,
  PendingReferralDigestItem,
  PENDING_REPORT_RECIPIENTS,
} from "@/lib/email";
import {
  getStoredPendingReportRecipients,
  getLastDigestSentAt,
  setLastDigestSentAt,
} from "@/lib/pending-recipients";

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

function parseEmailList(raw?: string | string[] | null): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .flatMap((item) => parseEmailList(item))
      .map((e) => e.trim())
      .filter((e) => e.length > 0);
  }

  const trimmed = raw.trim();
  if (!trimmed) return [];

  // Support JSON array format, e.g. '["email1@gmail.com", "email2@gmail.com"]'
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((e) => String(e).trim())
          .filter((e) => e.length > 0);
      }
    } catch {
      // fallback to delimiter splitting if JSON parsing fails
    }
  }

  return trimmed
    .split(/[,;]+/)
    .map((e) => e.trim())
    .filter((e) => e.length > 0);
}

/**
 * Returns the default recipient email(s) configured for pending referral alerts.
 */
export async function getDefaultPendingDigestRecipients(): Promise<string> {
  const recipients = await getStoredPendingReportRecipients();
  if (recipients.length > 0) {
    return recipients.join(", ");
  }

  return process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "admin@healthworkspros.net";
}

/**
 * Server action to gather all remaining pending Medical and BH referrals
 * and send a 24-hour summary email to the designated recipient(s).
 */
export async function checkAndSendPendingReferralsDigest(targetEmailOverride?: string | string[]) {
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

  // 3. Resolve target recipient emails
  let recipientEmails = parseEmailList(targetEmailOverride);

  // If no override was supplied, use stored recipients (no db)
  if (recipientEmails.length === 0) {
    recipientEmails = await getStoredPendingReportRecipients();
  }

  if (recipientEmails.length === 0) {
    recipientEmails = [process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "admin@healthworkspros.net"];
  }

  if (recipientEmails.length === 0) {
    recipientEmails = [process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "admin@healthworkspros.net"];
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
    toEmail: recipientEmails.length === 1 ? recipientEmails[0] : recipientEmails,
    medicalCount,
    bhCount,
    totalPending,
    items,
  });

  // Record timestamp of this run both in memory and on disk
  const now = Date.now();
  globalThis.__lastPendingDigestSentAt = now;
  await setLastDigestSentAt(now);

  return {
    success: true,
    totalPending,
    medicalCount,
    bhCount,
    sentTo: recipientEmails.join(", "),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Checks if 24 hours have elapsed since the last digest email and triggers the action if due.
 */
export async function triggerPendingDigestIfDue24h() {
  const fileLastSent = await getLastDigestSentAt();
  const memLastSent = globalThis.__lastPendingDigestSentAt || 0;
  const lastSent = Math.max(fileLastSent, memLastSent);
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

// Background checker interval: runs every 15 minutes to test if 24 hours have elapsed
const CHECK_INTERVAL_MS = 15 * 60 * 1000;

if (typeof window === "undefined" && !globalThis.__pendingDigestTimerInitialized) {
  globalThis.__pendingDigestTimerInitialized = true;

  setInterval(async () => {
    try {
      await triggerPendingDigestIfDue24h();
    } catch (err) {
      console.error("24h automatic pending referrals digest check error:", err);
    }
  }, CHECK_INTERVAL_MS);

  // Also check immediately upon server initialization
  triggerPendingDigestIfDue24h().catch(() => {});
}

