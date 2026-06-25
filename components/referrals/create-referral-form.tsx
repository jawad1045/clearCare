"use client";

import { useState, useTransition } from "react";
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

const SERVICE_TYPES = [
  "Drug Test",
  "Physical",
  "Medication Management",
  "IOP",
];
const REFERRAL_TYPES = [
  "Random",
  "Pre-employment",
  "Post-accident",
  "Reasonable Suspicion",
];
const PRIORITIES = ["Same-day", "24-hours"];
const GENDERS = ["Male", "Female", "Other"];
const GRADES = ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const RACES = [
  "American Indian or Alaska Native",
  "Asian",
  "Black or African American",
  "Hispanic or Latino",
  "Native Hawaiian or Other Pacific Islander",
  "White",
  "Two or More Races",
  "Other",
];

const referralSchema = z.object({
  serviceType: z.string().min(1, "Service type is required"),
  parentFirstName: z.string().optional(),
  parentLastName: z.string().optional(),
  parentEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
  parentPhone: z.string().optional(),
  patientFirstName: z.string().min(1, "Patient first name is required"),
  patientLastName: z.string().min(1, "Patient last name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  race: z.string().min(1, "Race is required"),
  grade: z.string().optional(),
  gender: z.string().min(1, "Gender is required"),
  ssn: z.string().min(1, "SSN is required"),
  type: z.string().min(1, "Test type is required"),
  priority: z.string().min(1, "Priority is required"),
  referrerName: z.string().min(1, "Referrer name is required"),
  contactDate: z.string().optional(),
  contactMethod: z.array(z.string()).optional(),
});

type ReferralFormValues = z.infer<typeof referralSchema>;

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
        toast.error("Failed to create referral");
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
          CLEAR-CARE™ Healthcare Referral Form
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
        title="Submit Referral"
        description="Are you sure you want to submit this referral? Please review all patient information before proceeding."
        confirmLabel="Submit Referral"
      />
      <form onSubmit={handleSubmit(onFormSubmit)} className="pl-6 pr-10 py-6 space-y-6">

        {/* ── Service Type ── */}
        <Field label="Select Service Type" required error={errors.serviceType?.message}>
          <Select onValueChange={(v) => setValue("serviceType", v, { shouldValidate: true })}>
            <SelectTrigger className="w-full border-border bg-background focus:ring-primary">
              <SelectValue placeholder="Choose service type..." />
            </SelectTrigger>
            <SelectContent>
              {SERVICE_TYPES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {/* ── Parent / Guardian ── */}
        <div>
          <SectionLabel>Parent / Guardian Information</SectionLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First Name">
              <Input {...register("parentFirstName")} placeholder="Parent first name"
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Last Name">
              <Input {...register("parentLastName")} placeholder="Parent last name"
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Email" error={errors.parentEmail?.message}>
              <Input type="email" {...register("parentEmail")} placeholder="parent@email.com"
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Phone">
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
          <SectionLabel>Patient Information</SectionLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First Name" required error={errors.patientFirstName?.message}>
              <Input {...register("patientFirstName")} placeholder="Patient first name"
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Last Name" required error={errors.patientLastName?.message}>
              <Input {...register("patientLastName")} placeholder="Patient last name"
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Date of Birth (MM/DD/YYYY)" required error={errors.dob?.message}>
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
            <Field label="Age (Auto-Calculated)">
              <Input
                value={age}
                placeholder="Auto"
                readOnly
                className="border-border bg-muted/40 text-muted-foreground focus-visible:ring-0 cursor-default"
              />
            </Field>
            <Field label="Race" required error={errors.race?.message}>
              <Select onValueChange={(v) => setValue("race", v, { shouldValidate: true })}>
                <SelectTrigger className="w-full border-border bg-background focus:ring-primary">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {RACES.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Grade">
              <Select onValueChange={(v) => setValue("grade", v)}>
                <SelectTrigger className="w-full border-border bg-background focus:ring-primary">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Field label="SSN" required error={errors.ssn?.message}>
              <div className="relative">
                <Input
                  type={showSSN ? "text" : "password"}
                  {...register("ssn")}
                  placeholder="XXX-XX-XXXX"
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
          <SectionLabel>Test Details</SectionLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Test Type" required error={errors.type?.message}>
              <Select onValueChange={(v) => setValue("type", v, { shouldValidate: true })}>
                <SelectTrigger className="w-full border-border bg-background focus:ring-primary">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {REFERRAL_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Priority" required error={errors.priority?.message}>
              <Select onValueChange={(v) => setValue("priority", v, { shouldValidate: true })}>
                <SelectTrigger className="w-full border-border bg-background focus:ring-primary">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Referrer Name (from your profile)" required error={errors.referrerName?.message}>
              <Input
                {...register("referrerName")}
                readOnly
                className="border-border bg-muted/40 text-muted-foreground focus-visible:ring-0 cursor-default"
              />
            </Field>
            <Field label="Date of Patient Contact">
              <DatePicker
                name="contactDate_display"
                onDateChange={(iso) => setValue("contactDate", iso)}
                className="border-border bg-background focus-visible:ring-primary"
              />
            </Field>
            <Field label="Method of Contact">
              <div className="flex h-10 items-center gap-4 rounded-md border border-border bg-background px-3">
                {["Text", "Phone", "Email"].map((method) => (
                  <label key={method} className="flex cursor-pointer items-center gap-1.5 text-sm">
                    <Checkbox
                      checked={contactMethods.includes(method)}
                      onCheckedChange={() => toggleContact(method)}
                      className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span className="text-xs text-foreground/80">{method}</span>
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
          className="w-full bg-foreground text-primary-foreground hover:bg-foreground/90 transition-colors h-11 text-sm font-semibold tracking-wide"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Submitting…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Submit Referral
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>

      </form>
    </div>
  );
}
