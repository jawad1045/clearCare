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
  "Drug Test (IOP)",
  "Drug Test (OP)",
  "Elder Care NOW®",
  "New Employment (OPE)",
  "Physical",
  "Primary Care",
  "Return to Work (DR)",
  "Worker's Compensation (OPE)",
] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const SERVICE_TYPE_LABEL_KEYS: Record<ServiceType, TranslationKey> = {
  "Drug Test (IOP)": "common.serviceDrugTestIOP",
  "Drug Test (OP)": "common.serviceDrugTestOP",
  "Elder Care NOW®": "referrals.referralTypeElderCareNow",
  "New Employment (OPE)": "common.serviceNewEmploymentOPE",
  "Physical": "common.servicePhysical",
  "Primary Care": "common.servicePrimaryCare",
  "Return to Work (DR)": "common.serviceReturnToWorkDR",
  "Worker's Compensation (OPE)": "common.serviceWorkersCompOPE",
};

export const PRIORITY_LABEL_KEYS: Record<string, TranslationKey> = {
  "Same-day": "referrals.prioritySameDay",
  "24-hours": "referrals.priority24Hours",
};

export const getPriorityLabel = (priority: string, t: any): string => {
  const key = PRIORITY_LABEL_KEYS[priority];
  return key ? t(key) : priority;
};

export const BH_REFERRAL_TYPES = [
  "New IOP (Battery)",
  "New OP (Battery)",
  "Psych. Evaluation (Youth)",
  "Psych. Evaluation (Adult)",
  "Individual IOP/OP Therapy",
  "General Therapy",
  "Couples Therapy",
  "Medication Management (MAT)",
  "EAP",
  "Neuro-Development Eval.",
  "Neurological Eval.",
  "Behavioral Assistant",
  "Family/Parent Coaching",
  "Other",
] as const;

export type BHReferralType = (typeof BH_REFERRAL_TYPES)[number];

export const BH_REFERRAL_TYPE_LABEL_KEYS: Record<BHReferralType, TranslationKey> = {
  "New IOP (Battery)": "referrals.referralTypeNewIopBattery",
  "New OP (Battery)": "referrals.referralTypeNewOpBattery",
  "Psych. Evaluation (Youth)": "referrals.referralTypePsychYouth",
  "Psych. Evaluation (Adult)": "referrals.referralTypePsychAdult",
  "Individual IOP/OP Therapy": "referrals.referralTypeIndividualIopOpTherapy",
  "General Therapy": "referrals.referralTypeGeneralTherapy",
  "Couples Therapy": "referrals.referralTypeCouplesTherapy",
  "Medication Management (MAT)": "referrals.referralTypeMedicationManagement",
  "EAP": "referrals.referralTypeEap",
  "Neuro-Development Eval.": "referrals.referralTypeNeuroDevelopmental",
  "Neurological Eval.": "referrals.referralTypeNeurological",
  "Behavioral Assistant": "referrals.referralTypeBehavioralAssistant",
  "Family/Parent Coaching": "referrals.referralTypeFamilyParentCoaching",
  "Other": "referrals.referralTypeOther",
};

