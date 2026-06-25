import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calcAge(isoDate: string): string {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const m = today.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--;
  return String(age);
}

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
