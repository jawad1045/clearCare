import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calcAge(isoDate: string | Date | null | undefined): string {
  if (!isoDate) return "";
  if (typeof isoDate === "string") {
    const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const today = new Date();
    if (match) {
      const birthYear = parseInt(match[1], 10);
      const birthMonth = parseInt(match[2], 10) - 1;
      const birthDay = parseInt(match[3], 10);
      let age = today.getFullYear() - birthYear;
      const m = today.getMonth() - birthMonth;
      if (m < 0 || (m === 0 && today.getDate() < birthDay)) age--;
      return String(age);
    }
  }
  const date = typeof isoDate === "string" ? new Date(isoDate) : isoDate;
  if (isNaN(date.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - date.getUTCFullYear();
  const m = today.getMonth() - date.getUTCMonth();
  if (m < 0 || (m === 0 && today.getDate() < date.getUTCDate())) age--;
  return String(age);
}

export const ageCalculator = calcAge;
export const calculateAge = calcAge;

/** Auto-formats input to MM/DD/YYYY and returns { display, iso } */
export function formatDobInput(raw: string): { display: string; iso: string } {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  let display = digits;
  if (digits.length > 4) display = digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
  else if (digits.length > 2) display = digits.slice(0, 2) + "/" + digits.slice(2);

  const iso =
    digits.length === 8
      ? `${digits.slice(4)}-${digits.slice(0, 2)}-${digits.slice(2, 4)}`
      : "";

  return { display, iso };
}

/** Auto-formats raw digits into (555) 555-1212 as the user types. */
export function formatPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  const len = digits.length;
  if (len === 0) return "";
  if (len < 4) return `(${digits}`;
  if (len < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** Looks up city/state for a US zip code via the free zippopotam.us API. */
export async function lookupZipCode(zip: string): Promise<{ city: string; state: string } | null> {
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!res.ok) return null;
    const data = await res.json();
    const place = data.places?.[0];
    if (!place) return null;
    return {
      city: place["place name"] as string,
      state: place["state abbreviation"] as string,
    };
  } catch {
    return null;
  }
}

export function formatSSNInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  const parts: string[] = [];
  if (digits.length > 0) parts.push(digits.slice(0, 3));
  if (digits.length > 3) parts.push(digits.slice(3, 5));
  if (digits.length > 5) parts.push(digits.slice(5, 9));
  return parts.join("-");
}

/** Masks an SSN to 9-digit format with last 4 digits visible: •••-••-1234 */
export function formatSSNMasked(ssn?: string | null): string {
  if (!ssn) return "—";
  const digits = ssn.replace(/\D/g, "");
  if (!digits) return "—";
  const last4 = digits.slice(-4).padStart(4, "0");
  return `•••-••-${last4}`;
}

/** Formats an SSN in full for admin view (e.g. 123-45-6789 or 4 digits if legacy). */
export function formatSSNFull(ssn?: string | null): string {
  if (!ssn) return "—";
  const digits = ssn.replace(/\D/g, "");
  if (!digits) return "—";
  if (digits.length === 4) return digits;
  const parts: string[] = [];
  if (digits.length > 0) parts.push(digits.slice(0, 3));
  if (digits.length > 3) parts.push(digits.slice(3, 5));
  if (digits.length > 5) parts.push(digits.slice(5, 9));
  return parts.join("-");
}

