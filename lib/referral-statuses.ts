export const REFERRAL_STATUSES = [
  "Pending",
  "Clear",
  "Lab",
  "NoShow",
  "Confirmed",
  "Refusal",
  "inProgress",
  "Ready",
] as const;

export type ReferralStatus = (typeof REFERRAL_STATUSES)[number];

export const STATUS_LABELS: Record<ReferralStatus, string> = {
  Pending: "Pending",
  Clear: "Clear",
  Lab: "Lab",
  NoShow: "No Show",
  Confirmed: "Confirmed",
  Refusal: "Refusal",
  inProgress: "In Progress",
  Ready: "Ready",
};

export const getStatusLabel = (status: string): string =>
  STATUS_LABELS[status as ReferralStatus] ?? status;

export const STATUS_COLORS: Record<ReferralStatus, string> = {
  Pending: "#F59E0B",     // Amber
  Clear: "#10B981",       // Green
  Lab: "#8B5CF6",         // Purple
  NoShow: "#EF4444",      // Red
  Confirmed: "#3B82F6",   // Blue
  Refusal: "#E11D48",     // Rose
  inProgress: "#06B6D4",  // Cyan
  Ready: "#059669",       // Emerald
};

export const STATUS_BADGES: Record<ReferralStatus, string> = {
  Pending: "bg-amber-100 text-amber-800 border-amber-200",
  Clear: "bg-green-100 text-green-800 border-green-200",
  Lab: "bg-violet-100 text-violet-800 border-violet-200",
  NoShow: "bg-red-100 text-red-800 border-red-200",
  Confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  Refusal: "bg-rose-100 text-rose-800 border-rose-200",
  inProgress: "bg-cyan-100 text-cyan-800 border-cyan-200",
  Ready: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export const STATUS_DESCRIPTIONS: Record<ReferralStatus, string> = {
  Pending: "Referral is awaiting review.",
  Clear: "Referral has been successfully cleared.",
  Lab: "Patient is awaiting lab results.",
  NoShow: "Patient did not attend the appointment.",
  Confirmed: "Referral has been confirmed.",
  Refusal: "Patient refused the referral.",
  inProgress: "Referral is currently being processed.",
  Ready: "Referral is ready for the next step.",
};

export const getStatusColor = (status: string): string => {
  return STATUS_COLORS[status as ReferralStatus] ?? "#6b7280";
};

export const getStatusBadge = (status: string): string => {
  return STATUS_BADGES[status as ReferralStatus] ?? "";
};

export const getStatusDescription = (status: string): string => {
  return STATUS_DESCRIPTIONS[status as ReferralStatus] ?? "";
};