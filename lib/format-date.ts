/**
 * The fallback IANA timezone used server-side (exports, PDF, server components).
 * Set NEXT_PUBLIC_APP_TIMEZONE in .env to override.
 * Client components use the user's browser timezone automatically via
 * the `useLocalFormatDate` hook — this fallback is never shown to users
 * browsing the app.
 */
export const APP_TIMEZONE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_APP_TIMEZONE) ||
  "America/New_York";

/**
 * Formats a date as MM/DD/YYYY.
 * @param date  - The date value to format.
 * @param timeZone - IANA timezone string. Defaults to APP_TIMEZONE.
 *                   In client components, pass the value from useLocalFormatDate()
 *                   so each user sees dates in their own timezone.
 */
export function formatDate(
  date: Date | string | null | undefined,
  timeZone: string = APP_TIMEZONE
): string {
  if (!date) return "";

  // If it's a date string like "1986-04-28" or "1986-04-28T00:00:00..."
  if (typeof date === "string") {
    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})(?:T00:00:00(?:\.000)?Z?)?$/);
    if (match) {
      return `${match[2]}/${match[3]}/${match[1]}`;
    }
  }

  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  // If the Date object has time 00:00:00.000 UTC (typical for pure date columns like DOB from Prisma @db.Date),
  // format using UTC so negative timezones (like US Eastern EDT/EST) do not roll back to the previous day.
  if (
    d.getUTCHours() === 0 &&
    d.getUTCMinutes() === 0 &&
    d.getUTCSeconds() === 0 &&
    d.getUTCMilliseconds() === 0
  ) {
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    const yyyy = d.getUTCFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(d);
}

/**
 * Formats a date as MM/DD/YYYY h:mm AM/PM.
 * @param date  - The date value to format.
 * @param timeZone - IANA timezone string. Defaults to APP_TIMEZONE.
 *                   In client components, pass the value from useLocalFormatDate().
 */
export function formatDateTime(
  date: Date | string | null | undefined,
  timeZone: string = APP_TIMEZONE
): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

/**
 * Returns the month index (0–11) of a date in the given timezone.
 * Use this for month-based filtering instead of `.getMonth()`.
 * @param date     - The date value.
 * @param timeZone - IANA timezone string. Defaults to APP_TIMEZONE.
 */
export function getMonthInTZ(
  date: Date | string,
  timeZone: string = APP_TIMEZONE
): number {
  const d = typeof date === "string" ? new Date(date) : date;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "numeric",
  }).formatToParts(d);
  const monthPart = parts.find((p) => p.type === "month");
  return monthPart ? parseInt(monthPart.value, 10) - 1 : d.getUTCMonth();
}

// Keep old export name as alias for backward compat with any remaining callers.
export const getMonthInAppTZ = (date: Date | string) =>
  getMonthInTZ(date, APP_TIMEZONE);
