"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Lock, Eye, EyeOff } from "lucide-react";

import { createReferral } from "@/action/referral.action";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { calcAge, formatPhoneInput } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import { AttachmentUploader } from "@/components/referrals/attachment-uploader";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { SERVICE_TYPES, SERVICE_TYPE_LABEL_KEYS } from "@/lib/referral-filters";
import { useTranslation } from "@/locale/use-translation";
import type { TranslationKey } from "@/locale/config";

const REFERRAL_TYPES = [
  "Random",
  "Pre-employment",
  "Post-accident",
  "Reasonable Suspicion",
] as const;
const REFERRAL_TYPE_LABEL_KEYS: Record<(typeof REFERRAL_TYPES)[number], TranslationKey> = {
  "Random": "referrals.typeRandom",
  "Pre-employment": "referrals.typePreEmployment",
  "Post-accident": "referrals.typePostAccident",
  "Reasonable Suspicion": "referrals.typeReasonableSuspicion",
};
const PRIORITIES = ["Same-day", "24-hours"] as const;
const PRIORITY_LABEL_KEYS: Record<(typeof PRIORITIES)[number], TranslationKey> = {
  "Same-day": "referrals.prioritySameDay",
  "24-hours": "referrals.priority24Hours",
};
const GENDERS = ["Male", "Female", "Other"] as const;
const GENDER_LABEL_KEYS: Record<(typeof GENDERS)[number], TranslationKey> = {
  Male: "common.genderMale",
  Female: "common.genderFemale",
  Other: "common.genderOther",
};
const GRADES = ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] as const;
const RACES = [
  "American Indian or Alaska Native",
  "Asian",
  "Black or African American",
  "Hispanic or Latino",
  "Native Hawaiian or Other Pacific Islander",
  "White",
  "Two or More Races",
  "Other",
] as const;
const RACE_LABEL_KEYS: Record<(typeof RACES)[number], TranslationKey> = {
  "American Indian or Alaska Native": "referrals.raceAmericanIndian",
  "Asian": "referrals.raceAsian",
  "Black or African American": "referrals.raceBlack",
  "Hispanic or Latino": "referrals.raceHispanic",
  "Native Hawaiian or Other Pacific Islander": "referrals.raceNativeHawaiian",
  "White": "referrals.raceWhite",
  "Two or More Races": "referrals.raceTwoOrMore",
  "Other": "referrals.raceOther",
};
const CONTACT_METHODS = ["Text", "Phone", "Email"] as const;
const CONTACT_METHOD_LABEL_KEYS: Record<(typeof CONTACT_METHODS)[number], TranslationKey> = {
  Text: "common.contactMethodText",
  Phone: "common.contactMethodPhone",
  Email: "common.contactMethodEmail",
};

function useReferralSchema(t: ReturnType<typeof useTranslation>["t"]) {
  return useMemo(
    () =>
      z.object({
        serviceType: z.string().min(1, t("referrals.serviceTypeRequired")),
        parentFirstName: z.string().optional(),
        parentLastName: z.string().optional(),
        parentEmail: z.string().email(t("common.validation.emailInvalid")).optional().or(z.literal("")),
        parentPhone: z.string().optional(),
        patientFirstName: z.string().min(1, t("referrals.patientFirstNameRequired")),
        patientLastName: z.string().min(1, t("referrals.patientLastNameRequired")),
        dob: z.string().min(1, t("referrals.dobRequired")),
        race: z.string().min(1, t("referrals.raceRequired")),
        grade: z.string().optional(),
        gender: z.string().min(1, t("referrals.genderRequired")),
        ssn: z.string().min(1, t("referrals.ssnRequired")),
        type: z.string().min(1, t("referrals.testTypeRequired")),
        priority: z.string().min(1, t("referrals.priorityRequired")),
        referrerName: z.string().min(1, t("referrals.referrerNameRequired")),
        contactDate: z.string().optional(),
        contactMethod: z.array(z.string()).optional(),
      }),
    [t]
  );
}

type ReferralFormValues = z.infer<ReturnType<typeof useReferralSchema>>;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
      {children}
    </p>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] font-semibold uppercase tracking-wide text-foreground/60">
        {label}
        {required && <span className="ml-0.5 text-primary">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

type Props = { referrerName: string };

export function CreateReferralForm({ referrerName }: Props) {
  const { t } = useTranslation();
  const referralSchema = useReferralSchema(t);
  const [isPending, startTransition] = useTransition();
  const [attachments, setAttachments] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<ReferralFormValues | null>(null);
  const [showSSN, setShowSSN] = useState(false);
  const [age, setAge] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReferralFormValues>({
    resolver: zodResolver(referralSchema),
    defaultValues: {
      serviceType: "",
      parentFirstName: "",
      parentLastName: "",
      parentEmail: "",
      parentPhone: "",
      patientFirstName: "",
      patientLastName: "",
      dob: "",
      race: "",
      grade: "",
      gender: "",
      ssn: "",
      type: "",
      priority: "",
      referrerName,
      contactDate: "",
      contactMethod: [],
    },
  });

  const contactMethods = watch("contactMethod") ?? [];

  async function submitReferral(values: ReferralFormValues) {
    const formData = new FormData();
    formData.set("serviceType", values.serviceType);
    formData.set("parentFirstName", values.parentFirstName ?? "");
    formData.set("parentLastName", values.parentLastName ?? "");
    formData.set("parentEmail", values.parentEmail ?? "");
    formData.set("parentPhone", values.parentPhone ?? "");
    formData.set("patientFirstName", values.patientFirstName);
    formData.set("patientLastName", values.patientLastName);
    formData.set("dob", values.dob);
    formData.set("race", values.race);
    formData.set("grade", values.grade ?? "");
    formData.set("gender", values.gender);
    formData.set("ssn", values.ssn);
    formData.set("type", values.type);
    formData.set("priority", values.priority);
    formData.set("status", "Pending");
    formData.set("referrerName", values.referrerName);
    formData.set("contactDate", values.contactDate ?? "");
    (values.contactMethod ?? []).forEach((m) => formData.append("contactMethod", m));
    attachments.forEach((url) => formData.append("attachments", url));

    startTransition(async () => {
      try {
        await createReferral(formData);
      } catch (error) {
        if (isRedirectError(error)) throw error;
        toast.error(t("referrals.createReferralFailed"));
      }
    });
  }

  function onFormSubmit(values: ReferralFormValues) {
    setPendingValues(values);
    setConfirmOpen(true);
  }

  function onConfirm() {
    setConfirmOpen(false);
    if (pendingValues) submitReferral(pendingValues);
    setPendingValues(null);
  }

  function toggleContact(value: string) {
    const next = contactMethods.includes(value)
      ? contactMethods.filter((v) => v !== value)
      : [...contactMethods, value];
    setValue("contactMethod", next);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border shadow-md bg-card w-full sm:w-3/5">

      {/* ── Header ── */}
      <div className="bg-foreground px-6 py-4">
        <h2 className="text-base font-bold text-primary-foreground">
          {t("referrals.referralFormTitle")}
        </h2>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-primary">
          <span>{t("referrals.requiredFieldsNote")}</span>
          <span className="text-primary/50">·</span>
          <Lock className="h-3 w-3" />
          <span>{t("referrals.hipaaEncryptedNote")}</span>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onConfirm={onConfirm}
        onCancel={() => { setConfirmOpen(false); setPendingValues(null); }}
        title={t("referrals.submitReferral")}
        description={t("referrals.submitReferralConfirmDescription")}
        confirmLabel={t("referrals.submitReferral")}
      />
      <form onSubmit={handleSubmit(onFormSubmit)} className="pl-6 pr-10 py-6 space-y-6">

        {/* ── Service Type ── */}
        <Field label={t("referrals.selectServiceType")} required error={errors.serviceType?.message}>
          <Select onValueChange={(v) => setValue("serviceType", v, { shouldValidate: true })}>
            <SelectTrigger className="w-full border-border bg-background focus:ring-primary">
              <SelectValue placeholder={t("referrals.chooseServiceTypePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {SERVICE_TYPES.map((s) => (
                <SelectItem key={s} value={s}>{t(SERVICE_TYPE_LABEL_KEYS[s])}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {/* ── Parent / Guardian ── */}
        <div>
          <SectionLabel>{t("referrals.parentGuardianInfo")}</SectionLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t("common.firstName")}>
              <Input {...register("parentFirstName")} placeholder={t("referrals.parentFirstNamePlaceholder")}
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label={t("common.lastName")}>
              <Input {...register("parentLastName")} placeholder={t("referrals.parentLastNamePlaceholder")}
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label={t("common.email")} error={errors.parentEmail?.message}>
              <Input type="email" {...register("parentEmail")} placeholder={t("referrals.parentEmailPlaceholder")}
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label={t("common.phone")}>
              <Input
                {...register("parentPhone", {
                  onChange: (e) => { e.target.value = formatPhoneInput(e.target.value); },
                })}
                placeholder="(555) 000-0000"
                maxLength={14}
                className="border-border bg-background focus-visible:ring-primary"
              />
            </Field>
          </div>
        </div>

        {/* ── Patient Information ── */}
        <div>
          <SectionLabel>{t("referrals.patientInformation")}</SectionLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t("common.firstName")} required error={errors.patientFirstName?.message}>
              <Input {...register("patientFirstName")} placeholder={t("referrals.patientFirstNamePlaceholder")}
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label={t("common.lastName")} required error={errors.patientLastName?.message}>
              <Input {...register("patientLastName")} placeholder={t("referrals.patientLastNamePlaceholder")}
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label={t("referrals.dobLabel")} required error={errors.dob?.message}>
              <DatePicker
                name="dob_display"
                required
                onDateChange={(iso) => {
                  setValue("dob", iso, { shouldValidate: true });
                  setAge(iso ? calcAge(iso) : "");
                }}
                className="border-border bg-background focus-visible:ring-primary"
              />
            </Field>
            <Field label={t("referrals.ageLabel")}>
              <Input
                value={age}
                placeholder={t("referrals.agePlaceholder")}
                readOnly
                className="border-border bg-muted/40 text-muted-foreground focus-visible:ring-0 cursor-default"
              />
            </Field>
            <Field label={t("referrals.raceLabel")} required error={errors.race?.message}>
              <Select onValueChange={(v) => setValue("race", v, { shouldValidate: true })}>
                <SelectTrigger className="w-full border-border bg-background focus:ring-primary">
                  <SelectValue placeholder={t("referrals.selectPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {RACES.map((r) => (
                    <SelectItem key={r} value={r}>{t(RACE_LABEL_KEYS[r])}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("referrals.gradeLabel")}>
              <Select onValueChange={(v) => setValue("grade", v)}>
                <SelectTrigger className="w-full border-border bg-background focus:ring-primary">
                  <SelectValue placeholder={t("referrals.selectPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((g) => (
                    <SelectItem key={g} value={g}>{g === "K" ? t("referrals.gradeK") : g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("referrals.genderLabel")} required error={errors.gender?.message}>
              <Select onValueChange={(v) => setValue("gender", v, { shouldValidate: true })}>
                <SelectTrigger className="w-full border-border bg-background focus:ring-primary">
                  <SelectValue placeholder={t("referrals.selectPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((g) => (
                    <SelectItem key={g} value={g}>{t(GENDER_LABEL_KEYS[g])}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("referrals.ssnLabel")} required error={errors.ssn?.message}>
              <div className="relative">
                <Input
                  type={showSSN ? "text" : "password"}
                  {...register("ssn")}
                  placeholder={t("referrals.ssnPlaceholder")}
                  className="border-border bg-background pr-10 focus-visible:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowSSN(!showSSN)}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                >
                  {showSSN ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
          </div>
        </div>

        {/* ── Test Details ── */}
        <div>
          <SectionLabel>{t("referrals.testDetails")}</SectionLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t("referrals.testTypeLabel")} required error={errors.type?.message}>
              <Select onValueChange={(v) => setValue("type", v, { shouldValidate: true })}>
                <SelectTrigger className="w-full border-border bg-background focus:ring-primary">
                  <SelectValue placeholder={t("referrals.selectTypePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {REFERRAL_TYPES.map((rt) => (
                    <SelectItem key={rt} value={rt}>{t(REFERRAL_TYPE_LABEL_KEYS[rt])}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("common.priority")} required error={errors.priority?.message}>
              <Select onValueChange={(v) => setValue("priority", v, { shouldValidate: true })}>
                <SelectTrigger className="w-full border-border bg-background focus:ring-primary">
                  <SelectValue placeholder={t("referrals.selectPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>{t(PRIORITY_LABEL_KEYS[p])}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("referrals.referrerNameLabel")} required error={errors.referrerName?.message}>
              <Input
                {...register("referrerName")}
                readOnly
                className="border-border bg-muted/40 text-muted-foreground focus-visible:ring-0 cursor-default"
              />
            </Field>
            <Field label={t("referrals.contactDateLabel")}>
              <DatePicker
                name="contactDate_display"
                onDateChange={(iso) => setValue("contactDate", iso)}
                className="border-border bg-background focus-visible:ring-primary"
              />
            </Field>
            <Field label={t("referrals.methodOfContactLabel")}>
              <div className="flex h-10 items-center gap-4 rounded-md border border-border bg-background px-3">
                {CONTACT_METHODS.map((method) => (
                  <label key={method} className="flex cursor-pointer items-center gap-1.5 text-sm">
                    <Checkbox
                      checked={contactMethods.includes(method)}
                      onCheckedChange={() => toggleContact(method)}
                      className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span className="text-xs text-foreground/80">{t(CONTACT_METHOD_LABEL_KEYS[method])}</span>
                  </label>
                ))}
              </div>
            </Field>
          </div>
        </div>

        {/* ── Attachments ── */}
        <AttachmentUploader value={attachments} onChange={setAttachments} />

        {/* ── Submit ── */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-foreground text-primary-foreground hover:bg-foreground/90 transition-colors h-11 px-6 py-2.5 text-sm font-semibold tracking-wide"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              {t("referrals.submitting")}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {t("referrals.submitReferral")}
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>

      </form>
    </div>
  );
}
