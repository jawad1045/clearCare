"use client";

import { useState, useTransition } from "react";
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

import { AttachmentUploader } from "@/components/referrals/attachment-uploader";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

const GENDERS = ["Male", "Female", "Other"];

const bhReferralSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone is required"),
  last4SSN: z
    .string()
    .min(1, "Last 4 of SSN is required")
    .max(4, "You can only enter 4 digits")
    .regex(/^\d{4}$/, "Enter exactly 4 digits"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  gender: z.string().min(1, "Gender is required"),
  referrerName: z.string().optional(),
  notes: z.string().optional(),
});

type BHReferralFormValues = z.infer<typeof bhReferralSchema>;

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

export function CreateBHReferralForm() {
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
      referrerName: "",
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
        toast.error(error instanceof Error ? error.message : "Failed to create behavioral health referral");
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
          CLEAR-CARE™ Behavioral Health Referral Form
        </h2>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-primary">
          <span>Fields marked * are required</span>
          <span className="text-primary/50">·</span>
          <Lock className="h-3 w-3" />
          <span>HIPAA Compliant · All data is encrypted</span>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onConfirm={onConfirm}
        onCancel={() => { setConfirmOpen(false); setPendingValues(null); }}
        title="Submit BH Referral"
        description="Are you sure you want to submit this behavioral health referral? Please review all client information before proceeding."
        confirmLabel="Submit BH Referral"
      />

      <form onSubmit={handleSubmit(onFormSubmit)} className="pl-6 pr-10 py-6 space-y-6">

        {/* ── Client Information ── */}
        <div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First Name" required error={errors.firstName?.message}>
              <Input
                {...register("firstName")}
                placeholder="Client first name"
                className="border-border bg-background focus-visible:ring-primary"
              />
            </Field>
            <Field label="Last Name" required error={errors.lastName?.message}>
              <Input
                {...register("lastName")}
                placeholder="Client last name"
                className="border-border bg-background focus-visible:ring-primary"
              />
            </Field>
            <Field label="Phone" required error={errors.phone?.message}>
              <Input
                {...register("phone")}
                placeholder="(555)000-0000"
                className="border-border bg-background focus-visible:ring-primary"
              />
            </Field>
            <Field label="Email">
              <Input
                {...register("email")}
                type="email"
                placeholder="client@email.com"
                className="border-border bg-background focus-visible:ring-primary"
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </Field>
            <Field label="Last 4 of SSN" required error={errors.last4SSN?.message}>
              <Input
                {...register("last4SSN", {
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
                  },
                })}
                inputMode="numeric"
                maxLength={4}
                placeholder="XXXX"
                className="border-border bg-background focus-visible:ring-primary"
              />
            </Field>
            <Field label="Gender" required error={errors.gender?.message}>
              <Select onValueChange={(v) => setValue("gender", v, { shouldValidate: true })}>
                <SelectTrigger className="w-full border-border bg-background focus:ring-primary">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>

        {/* ── Referral Details ── */}
        <div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Referrer Name">
              <Input
                {...register("referrerName")}
                placeholder="Referring person name"
                className="border-border bg-background focus-visible:ring-primary"
              />
            </Field>
            <Field label="Notes">
              <textarea
                {...register("notes")}
                placeholder="Any additional notes or clinical information..."
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
          className="w-full bg-foreground text-primary-foreground hover:bg-foreground/90 transition-colors h-11 text-sm font-semibold tracking-wide"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Submitting…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Submit BH Referral
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>

      </form>
    </div>
  );
}
