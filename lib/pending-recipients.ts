import fs from "fs/promises";
import path from "path";
import { PENDING_REPORT_RECIPIENTS } from "@/lib/email";

const RECIPIENTS_FILE_PATH = path.join(process.cwd(), "lib", "pending-recipients.json");
const STATE_FILE_PATH = path.join(process.cwd(), "lib", "pending-digest-state.json");

/**
 * Reads the timestamp of when the pending digest was last sent.
 */
export async function getLastDigestSentAt(): Promise<number> {
  try {
    const raw = await fs.readFile(STATE_FILE_PATH, "utf-8");
    const data = JSON.parse(raw);
    return typeof data.lastSentAt === "number" ? data.lastSentAt : 0;
  } catch {
    return 0;
  }
}

/**
 * Persists the timestamp of when the pending digest was sent.
 */
export async function setLastDigestSentAt(timestamp: number): Promise<void> {
  try {
    await fs.writeFile(STATE_FILE_PATH, JSON.stringify({ lastSentAt: timestamp }, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write digest state file:", err);
  }
}

/**
 * Reads the pending report recipient emails without querying the database.
 * Falls back to PENDING_REPORT_RECIPIENTS from lib/email.ts if file doesn't exist or is invalid.
 */
export async function getStoredPendingReportRecipients(): Promise<string[]> {
  try {
    const raw = await fs.readFile(RECIPIENTS_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const validEmails = parsed
        .map((e) => String(e).trim())
        .filter((e) => e.length > 0 && e.includes("@"));
      if (validEmails.length > 0) {
        return validEmails;
      }
    }
  } catch {
    // If file does not exist or error reading, fallback to PENDING_REPORT_RECIPIENTS
  }

  return [...PENDING_REPORT_RECIPIENTS];
}

/**
 * Saves the pending report recipient emails directly to the JSON configuration file without using a database.
 */
export async function setStoredPendingReportRecipients(emails: string[]): Promise<string[]> {
  const sanitized = Array.from(
    new Set(
      emails
        .map((e) => e.trim())
        .filter((e) => e.length > 0 && e.includes("@"))
    )
  );

  await fs.writeFile(RECIPIENTS_FILE_PATH, JSON.stringify(sanitized, null, 2), "utf-8");
  return sanitized;
}

