import type { TranslationKey } from "@/locale/config";

export const MONTH_KEYS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
] as const;
export type MonthKey = (typeof MONTH_KEYS)[number];

export const MONTH_LABEL_KEYS: Record<MonthKey, TranslationKey> = {
  january: "common.monthJanuary",
  february: "common.monthFebruary",
  march: "common.monthMarch",
  april: "common.monthApril",
  may: "common.monthMay",
  june: "common.monthJune",
  july: "common.monthJuly",
  august: "common.monthAugust",
  september: "common.monthSeptember",
  october: "common.monthOctober",
  november: "common.monthNovember",
  december: "common.monthDecember",
};

export const SERVICE_TYPES = [
  "Drug Test",
  "Drug Test (OM)",
  "IOP",
  "Medication Management",
  "New Employment (OM)",
  "Physical",
  "Primary Care",
  "Return-to-Work (OM)",
  "Worker's Compensation (OM)",
] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const SERVICE_TYPE_LABEL_KEYS: Record<ServiceType, TranslationKey> = {
  "Drug Test": "common.serviceDrugTest",
  "Drug Test (OM)": "common.serviceDrugTestOM",
  "IOP": "common.serviceIOP",
  "Medication Management": "common.serviceMedicationManagement",
  "New Employment (OM)": "common.serviceNewEmploymentOM",
  "Physical": "common.servicePhysical",
  "Primary Care": "common.servicePrimaryCare",
  "Return-to-Work (OM)": "common.serviceReturnToWorkOM",
  "Worker's Compensation (OM)": "common.serviceWorkersCompOM",
};

export const PRIORITY_LABEL_KEYS: Record<string, TranslationKey> = {
  "Same-day": "referrals.prioritySameDay",
  "24-hours": "referrals.priority24Hours",
};

export const getPriorityLabel = (priority: string, t: any): string => {
  const key = PRIORITY_LABEL_KEYS[priority];
  return key ? t(key) : priority;
};
