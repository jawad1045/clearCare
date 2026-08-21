"use client";

import { useMemo, useState, useEffect } from "react";
import { formatDate, formatDateTime, getMonthInTZ, APP_TIMEZONE } from "@/lib/format-date";

/**
 * Returns the current user's browser IANA timezone string,
 * e.g. "America/New_York", "Europe/London", "Asia/Karachi".
 *
 * Falls back to APP_TIMEZONE during SSR (when `window` is not available),
 * so there is no hydration mismatch — the client re-renders with the correct
 * timezone immediately after mount.
 */
function getBrowserTimezone(): string {
  if (typeof window === "undefined") return APP_TIMEZONE;
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || APP_TIMEZONE;
  } catch {
    return APP_TIMEZONE;
  }
}

/**
 * Hook that returns date/time formatters bound to the **user's own browser
 * timezone**, so every user sees dates in their local time regardless of
 * where the server runs.
 *
 * Usage (in any "use client" component):
 * ```tsx
 * const { formatDate, formatDateTime, getMonth, timeZone } = useLocalFormatDate();
 * // timeZone is e.g. "America/New_York" for US East Coast users,
 * //                   "Asia/Karachi" for Pakistan users, etc.
 * return <span>{formatDate(referral.dateOfReferral)}</span>;
 * ```
 *
 * Why a hook instead of just calling Intl directly?
 * - Memoises the timezone string so it is only resolved once per render cycle.
 * - Keeps the same call signature as lib/format-date.ts, making refactors easy.
 * - Works safely during SSR (falls back to APP_TIMEZONE, re-hydrates on client).
 */
export function useLocalFormatDate() {
  const [timeZone, setTimeZone] = useState<string>(APP_TIMEZONE);

  useEffect(() => {
    setTimeZone(getBrowserTimezone());
  }, []);

  return useMemo(
    () => ({
      /** The detected IANA timezone string for the current browser. */
      timeZone,

      /** Formats a date as MM/DD/YYYY in the user's local timezone. */
      formatDate: (date: Date | string | null | undefined) =>
        formatDate(date, timeZone),

      /** Formats a date as MM/DD/YYYY h:mm AM/PM in the user's local timezone. */
      formatDateTime: (date: Date | string | null | undefined) =>
        formatDateTime(date, timeZone),

      /**
       * Returns the month index (0–11) of a date in the user's local timezone.
       * Use this instead of `.getMonth()` for month-based filtering.
       */
      getMonth: (date: Date | string) => getMonthInTZ(date, timeZone),
    }),
    [timeZone]
  );
}
