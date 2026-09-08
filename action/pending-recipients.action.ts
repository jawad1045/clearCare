"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import {
  getStoredPendingReportRecipients,
  setStoredPendingReportRecipients,
} from "@/lib/pending-recipients";

const recipientsSchema = z
  .array(z.string().trim().email("Invalid email address"))
  .min(1, "At least one recipient email is required");

/**
 * Server action to fetch current pending report recipients without database.
 */
export async function getPendingReportRecipientsAction(): Promise<string[]> {
  return await getStoredPendingReportRecipients();
}

/**
 * Server action to save modified pending report recipients without database.
 */
export async function savePendingReportRecipientsAction(emails: string[]) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "Admin") {
    throw new Error("Only administrators can update pending report recipient emails.");
  }

  const parsed = recipientsSchema.safeParse(emails);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Invalid email addresses provided";
    throw new Error(message);
  }

  const updated = await setStoredPendingReportRecipients(parsed.data);
  revalidatePath("/admin/settings");
  return { success: true, recipients: updated };
}

