export const REFERRAL_STATUSES = [
  "Pending",
  "Clear",
  "Lab",
  "NoShow",
  "Confirmed",
  "Refusal",
  "inProgress",
  "referred",
] as const;

export type ReferralStatus = (typeof REFERRAL_STATUSES)[number];

export const STATUS_COLORS: Record<string, string> = {
  Pending:    "#f59e0b",
  Clear:      "#3b82f6",
  Lab:        "#22c55e",
  NoShow:     "#ef4444",
  Confirmed:  "#8b5cf6",
  Refusal:    "#e11d48",
  inProgress: "#10b981",
  referred:   "#6366f1",
};

export const STATUS_DESCRIPTIONS: Record<string, string> = {
  Pending:    "Your referral is awaiting review.",
  Clear:      "Your referral has been cleared.",
  Lab:        "Awaiting lab results.",
  NoShow:     "Patient did not attend the appointment.",
  Confirmed:  "Your referral has been confirmed.",
  Refusal:    "Patient refused the referral.",
  inProgress: "Your referral is currently in progress.",
  referred:   "Patient has been referred.",
};
