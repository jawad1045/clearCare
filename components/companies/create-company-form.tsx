"use client";

import { useState, useTransition } from "react";
import { Building2, MapPin, User, FileText } from "lucide-react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { createCompany } from "@/action/company.action";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

function FieldGroup({ icon: Icon, title, children }: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {children}
      </div>
    </div>
  );
}

function Field({ label, required, children }: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-foreground/80">
        {label}
        {required && <span className="ml-0.5 text-primary">*</span>}
      </Label>
      {children}
    </div>
  );
}

export function CreateCompanyForm() {
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingData, setPendingData] = useState<FormData | null>(null);

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createCompany(formData);
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
    <Card className="overflow-hidden border-border shadow-sm">
      {/* Teal accent bar */}
      <div className="h-1 w-full bg-primary" />

      <CardHeader className="pb-4 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
              Create Company
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Add a new organization to the system
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6">
        <ConfirmDialog
          open={confirmOpen}
          onConfirm={onConfirm}
          onCancel={() => { setConfirmOpen(false); setPendingData(null); }}
          title="Create Company"
          description="Are you sure you want to create this company? Please review all details before proceeding."
          confirmLabel="Create Company"
        />
        <form onSubmit={onFormSubmit} className="space-y-8">

          {/* Organization */}
          <FieldGroup icon={Building2} title="Organization">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium text-foreground/80">
                Organization Name<span className="ml-0.5 text-primary">*</span>
              </Label>
              <Input
                name="organization"
                placeholder="e.g. Acme Health Partners"
                required
                className="border-border bg-background focus-visible:ring-primary"
              />
            </div>
          </FieldGroup>

          <Separator className="bg-border/60" />

          {/* Address */}
          <FieldGroup icon={MapPin} title="Address">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium text-foreground/80">Street</Label>
              <Input
                name="street"
                placeholder="123 Main St"
                className="border-border bg-background focus-visible:ring-primary"
              />
            </div>
            <Field label="City" required>
              <Input name="city" placeholder="City" required
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="State" required>
              <Input name="state" placeholder="State" required
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Zip">
              <Input name="zip" placeholder="00000"
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
          </FieldGroup>

          <Separator className="bg-border/60" />

          {/* Contact */}
          <FieldGroup icon={User} title="Contact Person">
            <Field label="First Name" required>
              <Input name="firstName" placeholder="First name" required
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Last Name" required>
              <Input name="lastName" placeholder="Last name" required
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Email" required>
              <Input name="email" type="email" placeholder="name@company.com" required
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Phone" required>
              <Input name="phone" placeholder="+1 (555) 000-0000" required
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium text-foreground/80">Title</Label>
              <Input name="title" placeholder="e.g. Operations Manager"
                className="border-border bg-background focus-visible:ring-primary" />
            </div>
          </FieldGroup>

          <Separator className="bg-border/60" />

          {/* Notes */}
          <FieldGroup icon={FileText} title="Notes">
            <div className="space-y-1.5 sm:col-span-2">
              <Textarea
                name="notes"
                placeholder="Any additional notes about this company…"
                rows={4}
                className="resize-none border-border bg-background focus-visible:ring-primary"
              />
            </div>
          </FieldGroup>

          <div className="flex justify-end pt-2">
            <Button
              disabled={isPending}
              className="min-w-35 bg-primary text-primary-foreground hover:bg-[#0D6B60] transition-colors"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Creating…
                </span>
              ) : "Create Company"}
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}