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
