"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Lock, Eye, EyeOff } from "lucide-react";

import { createBHReferral } from "@/action/bh-referral.action";
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

import { calcAge } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import { AttachmentUploader } from "@/components/referrals/attachment-uploader";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

const BH_REFERRAL_TYPES = [
  "Initial Assessment",
  "Follow-up",
  "Crisis Intervention",
  "Treatment Planning",
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

export function CreateBHReferralForm() {
  const [isPending, startTransition] = useTransition();
  const [attachments, setAttachments] = useState<string[]>([]);
  const [contactMethods, setContactMethods] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingData, setPendingData] = useState<FormData | null>(null);
  const [showSSN, setShowSSN] = useState(false);
  const [age, setAge] = useState("");

  async function handleSubmit(formData: FormData) {
    contactMethods.forEach((m) => formData.append("contactMethod", m));
    startTransition(async () => {
      try {
        await createBHReferral(formData);
      } catch (error) {
        if (isRedirectError(error)) throw error;
        toast.error("Failed to create behavioral health referral");
      }
    });
  }

  function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPendingData(new FormData(e.currentTarget));
    setConfirmOpen(true);
  }

  function onConfirm() {
    setConfirmOpen(false);
    if (pendingData) handleSubmit(pendingData);
    setPendingData(null);
  }

  function toggleContact(value: string) {
    setContactMethods((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
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
        onCancel={() => { setConfirmOpen(false); setPendingData(null); }}
        title="Submit BH Referral"
        description="Are you sure you want to submit this behavioral health referral? Please review all client information before proceeding."
        confirmLabel="Submit BH Referral"
      />
      <form onSubmit={onFormSubmit} className="pl-6 pr-10 py-6 space-y-6">

        {/* Hidden attachment URLs */}
        {attachments.map((url) => (
          <input key={url} type="hidden" name="attachments" value={url} />
        ))}

        {/* ── Service Type ── */}
        <input type="hidden" name="serviceType" value="Behavioral Health" />
        <Field label="Service Type">
          <Input
            value="Behavioral Health"
            readOnly
            className="border-border bg-muted/40 text-muted-foreground focus-visible:ring-0 cursor-default"
          />
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
            <Field label="Date of Birth (MM/DD/YYYY)" required>
              <DatePicker
                name="dob"
                required
                onDateChange={(iso) => setAge(iso ? calcAge(iso) : "")}
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
            <Field label="Race" required>
              <Select name="race">
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
              <Select name="grade">
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
            <Field label="Gender" required>
              <Select name="gender">
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
            <Field label="SSN" required>
              <div className="relative">
                <Input
                  type={showSSN ? "text" : "password"}
                  name="ssn"
                  placeholder="XXX-XX-XXXX"
                  required
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

        {/* ── Referral Details ── */}
        <div>
          <SectionLabel>Referral Details</SectionLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Referral Type" required>
              <Select name="type">
                <SelectTrigger className="w-full border-border bg-background focus:ring-primary">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {BH_REFERRAL_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Priority" required>
              <Select name="priority">
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
            {/* status is always Pending on creation — admin changes it later */}
            <input type="hidden" name="status" value="Pending" />
            <Field label="Referrer Name" required>
              <Input name="referrerName" placeholder="Referring person name"
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Date of Patient Contact">
              <DatePicker
                name="contactDate"
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
            <Field label="Notes">
              <textarea
                name="notes"
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
