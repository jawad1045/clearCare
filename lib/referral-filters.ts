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

export const SERVICE_TYPES = ["Drug Test", "Physical", "Medication Management", "IOP"] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const SERVICE_TYPE_LABEL_KEYS: Record<ServiceType, TranslationKey> = {
  "Drug Test": "common.serviceDrugTest",
  "Physical": "common.servicePhysical",
  "Medication Management": "common.serviceMedicationManagement",
  "IOP": "common.serviceIOP",
};
