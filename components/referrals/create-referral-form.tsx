"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Lock } from "lucide-react";

import { createReferral } from "@/action/referral.action";

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

import { AttachmentUploader } from "@/components/referrals/attachment-uploader";
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
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] font-semibold uppercase tracking-wide text-foreground/60">
        {label}
        {required && <span className="ml-0.5 text-primary">*</span>}
      </Label>
      {children}
    </div>
  );
}

export function CreateReferralForm() {
  const [isPending, startTransition] = useTransition();
  const [attachments, setAttachments] = useState<string[]>([]);
  const [contactMethods, setContactMethods] = useState<string[]>([]);

  async function handleSubmit(formData: FormData) {
    contactMethods.forEach((m) => formData.append("contactMethod", m));
    startTransition(async () => {
      try {
        await createReferral(formData);
      } catch {
        toast.error("Failed to create referral");
      }
    });
  }

  function toggleContact(value: string) {
    setContactMethods((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border shadow-md bg-card">

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

      <form action={handleSubmit} className="px-6 py-6 space-y-6">

        {/* Hidden attachment URLs */}
        {attachments.map((url) => (
          <input key={url} type="hidden" name="attachments" value={url} />
        ))}

        {/* ── Service Type ── */}
        <Field label="Select Service Type" required>
          <Select name="serviceType">
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
              <Input name="parentFirstName" placeholder="Parent first name"
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Last Name">
              <Input name="parentLastName" placeholder="Parent last name"
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Email">
              <Input type="email" name="parentEmail" placeholder="parent@email.com"
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Phone">
              <Input name="parentPhone" placeholder="(555)000-0000"
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
          </div>
        </div>

        {/* ── Patient Information ── */}
        <div>
          <SectionLabel>Patient Information</SectionLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First Name" required>
              <Input name="patientFirstName" placeholder="Patient first name" required
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Last Name" required>
              <Input name="patientLastName" placeholder="Patient last name" required
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Date of Birth" required>
              <Input type="date" name="dob" required
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Age (Auto-Calculated)">
              <Input
                placeholder="Auto"
                readOnly
                className="border-border bg-muted/40 text-muted-foreground focus-visible:ring-0 cursor-default"
              />
            </Field>
            <Field label="Race" required>
              <Select name="race">
                <SelectTrigger className="border-border bg-background focus:ring-primary">
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
              <Select name="grade">
                <SelectTrigger className="border-border bg-background focus:ring-primary">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Gender" required>
              <Select name="gender">
                <SelectTrigger className="border-border bg-background focus:ring-primary">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="SSN (Encrypted)" required>
              <Input name="ssn" placeholder="XXX-XX-XXXX" required
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
          </div>
        </div>

        {/* ── Test Details ── */}
        <div>
          <SectionLabel>Test Details</SectionLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Test Type" required>
              <Select name="type">
                <SelectTrigger className="border-border bg-background focus:ring-primary">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {REFERRAL_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Priority" required>
              <Select name="priority">
                <SelectTrigger className="border-border bg-background focus:ring-primary">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {/* status is always Pending on creation — admin changes it later */}
            <input type="hidden" name="status" value="Pending" />
            <Field label="Referrer Name" required>
              <Input name="referrerName" placeholder="Referring person name"
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Date of Patient Contact">
              <Input type="date" name="contactDate"
                className="border-border bg-background focus-visible:ring-primary" />
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