"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Lock } from "lucide-react";

import { createBHReferral } from "@/action/bh-referral.action";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const GENDERS = ["Male", "Female", "Other"] as const;
const GENDER_LABEL_KEYS: Record<(typeof GENDERS)[number], TranslationKey> = {
  Male: "common.genderMale",
  Female: "common.genderFemale",
  Other: "common.genderOther",
};

function useBHReferralSchema(t: ReturnType<typeof useTranslation>["t"]) {
  return useMemo(
    () =>
      z.object({
        firstName: z.string().min(1, t("common.validation.firstNameRequired")),
        lastName: z.string().min(1, t("common.validation.lastNameRequired")),
        phone: z
          .string()
          .min(1, t("common.validation.phoneRequired"))
          .regex(/^\(\d{3}\) \d{3}-\d{4}$/, t("common.validation.phoneInvalid")),
        last4SSN: z
          .string()
          .min(1, t("referrals.last4SsnRequired"))
          .max(4, t("referrals.last4SsnMax"))
          .regex(/^\d{4}$/, t("referrals.last4SsnFormat")),
        email: z.string().email(t("common.validation.emailInvalid")).optional().or(z.literal("")),
        gender: z.string().min(1, t("referrals.genderRequired")),
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

type Props = { referrerName: string };

export function CreateBHReferralForm({ referrerName }: Props) {
  const { t } = useTranslation();
  const bhReferralSchema = useBHReferralSchema(t);
  const [isPending, startTransition] = useTransition();
  const [attachments, setAttachments] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<BHReferralFormValues | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BHReferralFormValues>({
    resolver: zodResolver(bhReferralSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      last4SSN: "",
      email: "",
      gender: "",
      referrerName,
      notes: "",
    },
  });

  async function submitReferral(values: BHReferralFormValues) {
    const formData = new FormData();
    formData.set("firstName", values.firstName);
    formData.set("lastName", values.lastName);
    formData.set("phone", values.phone);
    formData.set("last4SSN", values.last4SSN);
    formData.set("email", values.email ?? "");
    formData.set("gender", values.gender);
    formData.set("referrerName", values.referrerName ?? "");
    formData.set("notes", values.notes ?? "");
    attachments.forEach((url) => formData.append("attachments", url));

    startTransition(async () => {
      try {
        await createBHReferral(formData);
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
    <div className="overflow-hidden rounded-xl border border-border shadow-md bg-card w-full sm:w-3/5">

      {/* ── Header ── */}
      <div className="bg-foreground px-6 py-4">
        <h2 className="text-base font-bold text-primary-foreground">
          {t("referrals.bhReferralFormTitle")}
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
        title={t("referrals.submitBhReferral")}
        description={t("referrals.submitBhReferralConfirmDescription")}
        confirmLabel={t("referrals.submitBhReferral")}
      />

      <form onSubmit={handleSubmit(onFormSubmit)} className="pl-6 pr-10 py-6 space-y-6">

        {/* ── Client Information ── */}
        <div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t("common.firstName")} required error={errors.firstName?.message}>
              <Input
                {...register("firstName")}
                placeholder={t("referrals.clientFirstNamePlaceholder")}
                className="border-border bg-background focus-visible:ring-primary"
              />
            </Field>
            <Field label={t("common.lastName")} required error={errors.lastName?.message}>
              <Input
                {...register("lastName")}
                placeholder={t("referrals.clientLastNamePlaceholder")}
                className="border-border bg-background focus-visible:ring-primary"
              />
            </Field>
            <Field label={t("common.phone")} required error={errors.phone?.message}>
              <Input
                {...register("phone", {
                  onChange: (e) => { e.target.value = formatPhoneInput(e.target.value); },
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
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </Field>
            <Field label={t("referrals.last4SsnLabel")} required error={errors.last4SSN?.message}>
              <Input
                {...register("last4SSN", {
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
                  },
                })}
                inputMode="numeric"
                maxLength={4}
                placeholder={t("referrals.last4SsnPlaceholder")}
                className="border-border bg-background focus-visible:ring-primary"
              />
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
          </div>
        </div>

        {/* ── Referral Details ── */}
        <div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t("referrals.referrerNameLabel")}>
              <Input
                {...register("referrerName")}
                readOnly
                className="border-border bg-muted/40 text-muted-foreground focus-visible:ring-0 cursor-default"
              />
            </Field>
            <Field label={t("common.notes")}>
              <textarea
                {...register("notes")}
                placeholder={t("referrals.notesPlaceholder")}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                rows={3}
              />
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
              {t("referrals.submitBhReferral")}
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>

      </form>
    </div>
  );
}
