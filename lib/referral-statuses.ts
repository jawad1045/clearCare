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

const STATUS_LABELS_ES: Record<ReferralStatus, string> = {
  Pending: "Pendiente",
  Clear: "Aprobado",
  Lab: "Laboratorio",
  NoShow: "No Asistió",
  Confirmed: "Confirmado",
  Refusal: "Rechazado",
  inProgress: "En Progreso",
  Ready: "Listo",
};

export const getStatusLabel = (status: string, locale: "en" | "es" = "en"): string => {
  const labels = locale === "es" ? STATUS_LABELS_ES : STATUS_LABELS;
  return labels[status as ReferralStatus] ?? status;
};

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

const STATUS_DESCRIPTIONS_ES: Record<ReferralStatus, string> = {
  Pending: "La referencia está pendiente de revisión.",
  Clear: "La referencia ha sido aprobada exitosamente.",
  Lab: "El paciente está esperando los resultados de laboratorio.",
  NoShow: "El paciente no asistió a la cita.",
  Confirmed: "La referencia ha sido confirmada.",
  Refusal: "El paciente rechazó la referencia.",
  inProgress: "La referencia está siendo procesada actualmente.",
  Ready: "La referencia está lista para el siguiente paso.",
};

export const getStatusDescription = (status: string, locale: "en" | "es" = "en"): string => {
  const descriptions = locale === "es" ? STATUS_DESCRIPTIONS_ES : STATUS_DESCRIPTIONS;
  return descriptions[status as ReferralStatus] ?? "";
};