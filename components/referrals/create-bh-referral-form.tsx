"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Lock, Eye, EyeOff } from "lucide-react";

import { createBHReferral } from "@/action/referral.action";
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

const BH_REFERRAL_TYPES = [
  "Initial Assessment",
  "Follow-up",
  "Crisis Intervention",
  "Treatment Planning",
];
const PRIORITIES = ["Same-day", "24-hours"];
const GENDERS = ["Male", "Female", "Other"];

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
  full,
}: {
  label: string;
  required?: boolean;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1${full ? " sm:col-span-2" : ""}`}>
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
  const [showSSN, setShowSSN] = useState(false);
  const [age, setAge] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingData, setPendingData] = useState<FormData | null>(null);

  function calcAge(e: React.ChangeEvent<HTMLInputElement>) {
    const dob = new Date(e.target.value);
    if (!isNaN(dob.getTime())) {
      const today = new Date();
      let a = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) a--;
      setAge(String(a));
    } else {
      setAge("");
    }
  }

  async function handleSubmit(formData: FormData) {
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

  return (
    <div className="overflow-hidden rounded-xl border border-border shadow-md bg-card">

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

      <form onSubmit={onFormSubmit} className="px-6 py-6 space-y-6">

        {/* Hidden attachment URLs */}
        {attachments.map((url) => (
          <input key={url} type="hidden" name="attachments" value={url} />
        ))}
        {/* Status is always Pending on creation — admin changes it later */}
        <input type="hidden" name="status" value="Pending" />

        {/* ── Client Information ── */}
        <div>
          <SectionLabel>Client Information</SectionLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First Name" required>
              <Input name="patientFirstName" placeholder="First name" required
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Last Name" required>
              <Input name="patientLastName" placeholder="Last name" required
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Date of Birth (DD/MM/YYYY)" required>
              <Input type="date" name="dob" required onChange={calcAge}
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Age (Auto-Calculated)">
              <Input value={age} placeholder="Auto" readOnly
                className="border-border bg-muted/40 text-muted-foreground focus-visible:ring-0 cursor-default" />
            </Field>
            <Field label="Phone #" required>
              <Input type="tel" name="phone" placeholder="(555) 000-0000" required
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Last 4 of SS#" required>
              <div className="relative">
                <Input
                  type={showSSN ? "text" : "password"}
                  name="ssn"
                  placeholder="XXXX"
                  maxLength={4}
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
            <Field label="Email">
              <Input type="email" name="email" placeholder="client@email.com"
                className="border-border bg-background focus-visible:ring-primary" />
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
            <Field label="Notes" full>
              <textarea
                name="notes"
                placeholder="Any additional notes or clinical information..."
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                rows={4}
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
