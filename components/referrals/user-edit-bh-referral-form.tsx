"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, ChevronDown, Lock, X } from "lucide-react";

import { userUpdateBHReferralDetails } from "@/action/bh-referral.action";
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

import { formatPhoneInput } from "@/lib/utils";
import { AttachmentUploader } from "@/components/referrals/attachment-uploader";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { useTranslation } from "@/locale/use-translation";
import type { TranslationKey } from "@/locale/config";

const GENDERS = ["Male", "Female", "Non-Binary", "Other"] as const;
const GENDER_LABEL_KEYS: Record<(typeof GENDERS)[number], TranslationKey> = {
  Male: "common.genderMale",
  Female: "common.genderFemale",
  "Non-Binary": "common.genderNonBinary",
  Other: "common.genderOther",
};

const GRADES = ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] as const;

const BH_REFERRAL_TYPES = [
  "New IOP (Battery)",
  "Psych. Evaluation (Youth)",
  "Psych. Evaluation (Adult)",
  "Individual IOP Therapy",
  "General Therapy",
  "Couples Therapy",
  "Medication Management (MAT)",
  "EAP",
  "Neuro-Development Eval.",
  "Neurological Eval.",
] as const;

const BH_REFERRAL_TYPE_LABEL_KEYS: Record<(typeof BH_REFERRAL_TYPES)[number], TranslationKey> = {
  "New IOP (Battery)": "referrals.referralTypeNewIopBattery",
  "Psych. Evaluation (Youth)": "referrals.referralTypePsychYouth",
  "Psych. Evaluation (Adult)": "referrals.referralTypePsychAdult",
  "Individual IOP Therapy": "referrals.referralTypeIndividualIopTherapy",
  "General Therapy": "referrals.referralTypeGeneralTherapy",
  "Couples Therapy": "referrals.referralTypeCouplesTherapy",
  "Medication Management (MAT)": "referrals.referralTypeMedicationManagement",
  "EAP": "referrals.referralTypeEap",
  "Neuro-Development Eval.": "referrals.referralTypeNeuroDevelopmental",
  "Neurological Eval.": "referrals.referralTypeNeurological",
};

function useBHReferralSchema(t: ReturnType<typeof useTranslation>["t"]) {
  return useMemo(
    () =>
      z.object({
        referralTypes: z.array(z.string()).min(1, t("referrals.referralTypeRequired")),
        firstName: z.string().min(1, t("common.validation.firstNameRequired")),
        lastName: z.string().min(1, t("common.validation.lastNameRequired")),
        phone: z
          .string()
          .min(1, t("common.validation.phoneRequired"))
          .regex(/^\(\d{3}\) \d{3}-\d{4}$/, t("common.validation.phoneInvalid")),
        last4SSN: z
          .string()
          .max(4, t("referrals.last4SsnMax"))
          .optional(),
        email: z.string().email(t("common.validation.emailInvalid")).optional().or(z.literal("")),
        gender: z.string().min(1, t("referrals.genderRequired")),
        grade: z.string().optional(),
        referrerName: z.string().optional(),
        notes: z.string().optional(),
      }),
    [t]
  );
}

type BHReferralFormValues = z.infer<ReturnType<typeof useBHReferralSchema>>;

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

type Props = {
  referralId: number;
  initialData: any;
  onSuccess?: () => void;
};

export function UserEditBHReferralForm({ referralId, initialData, onSuccess }: Props) {
  const { t } = useTranslation();
  const bhReferralSchema = useBHReferralSchema(t);
  const [isPending, startTransition] = useTransition();
  const [attachments, setAttachments] = useState<string[]>(initialData?.clientAttachments || []);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<BHReferralFormValues | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BHReferralFormValues>({
    resolver: zodResolver(bhReferralSchema),
    defaultValues: {
      referralTypes: initialData?.referralType || [],
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      phone: initialData?.phone || "",
      last4SSN: initialData?.last4SSN || "",
      email: initialData?.email || "",
      gender: initialData?.gender || "",
      grade: initialData?.grade || "",
      referrerName: initialData?.referName || "",
      notes: initialData?.notes || "",
    },
  });

  const referralTypes = watch("referralTypes") ?? [];
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const typeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (typeMenuRef.current && !typeMenuRef.current.contains(e.target as Node)) {
        setTypeMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleReferralType(value: string) {
    const next = referralTypes.includes(value)
      ? referralTypes.filter((v) => v !== value)
      : [...referralTypes, value];
    setValue("referralTypes", next, { shouldValidate: true });
  }

  async function submitReferral(values: BHReferralFormValues) {
    const formData = new FormData();
    (values.referralTypes ?? []).forEach((rt) => formData.append("referralTypes", rt));
    formData.set("firstName", values.firstName);
    formData.set("lastName", values.lastName);
    formData.set("phone", values.phone);
    if (values.last4SSN) formData.set("last4SSN", values.last4SSN);
    formData.set("email", values.email ?? "");
    formData.set("gender", values.gender);
    formData.set("grade", values.grade ?? "");
    formData.set("notes", values.notes ?? "");
    attachments.forEach((url) => formData.append("attachments", url));

    startTransition(async () => {
      try {
        await userUpdateBHReferralDetails(referralId, formData);
        toast.success(t("referrals.referralUpdatedSuccess"));
        if (onSuccess) onSuccess();
      } catch (error) {
        if (isRedirectError(error)) throw error;
        toast.error(error instanceof Error ? error.message : t("referrals.createBhReferralFailed"));
      }
    });
  }

  function onFormSubmit(values: BHReferralFormValues) {
    setPendingValues(values);
    setConfirmOpen(true);
  }

  function onConfirm() {
    setConfirmOpen(false);
    if (pendingValues) submitReferral(pendingValues);
    setPendingValues(null);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border shadow-md bg-card w-full">
      {/* ── Header ── */}
      <div className="bg-foreground px-6 py-4">
        <h2 className="text-base font-bold text-primary-foreground">
          {t("common.edit")}
        </h2>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-primary-foreground">
          <span>{t("referrals.requiredFieldsNote")}</span>
          <span className="text-primary/50">·</span>
          <Lock className="h-3 w-3" />
          <span>{t("referrals.hipaaEncryptedNote")}</span>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onConfirm={onConfirm}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingValues(null);
        }}
        title={t("common.edit")}
        description={t("common.confirmAction")}
        confirmLabel={t("common.save")}
      />

      <form
        onSubmit={handleSubmit(onFormSubmit)}
        className="pl-6 pr-10 py-6 space-y-6"
      >
        {/* ── Referral Type ── */}
        <Field
          label={t("referrals.referralTypeLabel")}
          required
          error={errors.referralTypes?.message}
        >
          <div className="relative" ref={typeMenuRef}>
            <button
              type="button"
              onClick={() => setTypeMenuOpen((o) => !o)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <span className={referralTypes.length === 0 ? "text-muted-foreground" : ""}>
                {referralTypes.length > 0
                  ? `${referralTypes.length} selected`
                  : t("referrals.selectPlaceholder")}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${typeMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {typeMenuOpen && (
              <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md">
                {BH_REFERRAL_TYPES.map((rt) => {
                  const checked = referralTypes.includes(rt);
                  return (
                    <label
                      key={rt}
                      className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted/60"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleReferralType(rt)}
                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <span>{t(BH_REFERRAL_TYPE_LABEL_KEYS[rt])}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {referralTypes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {referralTypes.map((rt) => (
                <span
                  key={rt}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs text-foreground/80"
                >
                  {t(BH_REFERRAL_TYPE_LABEL_KEYS[rt as (typeof BH_REFERRAL_TYPES)[number]])}
                  <button
                    type="button"
                    onClick={() => toggleReferralType(rt)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Remove"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Field>

        {/* ── Client Information ── */}
        <div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label={t("common.firstName")}
              required
              error={errors.firstName?.message}
            >
              <Input
                {...register("firstName")}
                placeholder={t("referrals.clientFirstNamePlaceholder")}
                className="border-border bg-background focus-visible:ring-primary"
              />
            </Field>

            <Field
              label={t("common.lastName")}
              required
              error={errors.lastName?.message}
            >
              <Input
                {...register("lastName")}
                placeholder={t("referrals.clientLastNamePlaceholder")}
                className="border-border bg-background focus-visible:ring-primary"
              />
            </Field>

            <Field
              label={t("common.phone")}
              required
              error={errors.phone?.message}
            >
              <Input
                {...register("phone", {
                  onChange: (e) => {
                    e.target.value = formatPhoneInput(e.target.value);
                  },
                })}
                placeholder="(555) 000-0000"
                maxLength={14}
                className="border-border bg-background focus-visible:ring-primary"
              />
            </Field>

            <Field label={t("common.email")}>
              <Input
                {...register("email")}
                type="email"
                placeholder={t("referrals.clientEmailPlaceholder")}
                className="border-border bg-background focus-visible:ring-primary"
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </Field>

            <Field
              label={t("referrals.last4SsnLabel")}
              error={errors.last4SSN?.message}
            >
              <Input
                {...register("last4SSN", {
                  onChange: (e) => {
                    e.target.value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 4);
                  },
                })}
                inputMode="numeric"
                maxLength={4}
                placeholder={t("referrals.last4SsnPlaceholder")}
                className="border-border bg-background focus-visible:ring-primary"
              />
            </Field>

            <Field
              label={t("referrals.genderLabel")}
              required
              error={errors.gender?.message}
            >
              <Select
                value={watch("gender")}
                onValueChange={(v) =>
                  setValue("gender", v, { shouldValidate: true })
                }
              >
                <SelectTrigger className="w-full border-border bg-background focus:ring-primary">
                  <SelectValue
                    placeholder={t("referrals.selectPlaceholder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {t(GENDER_LABEL_KEYS[g])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={t("referrals.gradeLabel")}>
              <Select value={watch("grade")} onValueChange={(v) => setValue("grade", v)}>
                <SelectTrigger className="w-full border-border bg-background focus:ring-primary">
                  <SelectValue
                    placeholder={t("referrals.selectPlaceholder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g === "K" ? t("referrals.gradeK") : g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("referrals.referrerNameLabel")}>
              <Input
                {...register("referrerName")}
                readOnly
                className="border-border bg-muted/40 text-muted-foreground focus-visible:ring-0 cursor-default"
              />
            </Field>
          </div>
        </div>


        {/* ── Attachments ── */}
        <AttachmentUploader
          value={attachments}
          onChange={setAttachments}
        />

        {/* ── Notes ── */}
        <div className="sm:col-span-2">
          <Field label={t("common.notes")}><textarea
            {...register("notes")}
            placeholder={t("referrals.notesPlaceholder")}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            rows={3}
          /></Field>
        </div>

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
              {t("common.save")}
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}
