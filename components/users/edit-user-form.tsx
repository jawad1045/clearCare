"use client";

import { useState, useTransition } from "react";
import { UserCog, Building2, MapPin, ShieldCheck, ToggleLeft } from "lucide-react";

import { updateUser } from "@/action/user.action";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type Company = {
  id: number;
  organization: string;
  street: string | null;
  city: string;
  state: string;
  zip: string | null;
};

type User = {
  id: number;
  acctId: number;
  organization: string;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  contactTitle: string | null;
  userRole: string;
  isActive: boolean;
};

type Props = { user: User; companies: Company[] };

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

function Field({ label, required, full, children }: {
  label: string;
  required?: boolean;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5${full ? " sm:col-span-2" : ""}`}>
      <Label className="text-xs font-medium text-foreground/80">
        {label}
        {required && <span className="ml-0.5 text-primary">*</span>}
      </Label>
      {children}
    </div>
  );
}

export function EditUserForm({ user, companies }: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedCompany, setSelectedCompany] = useState(
    companies.find((c) => c.id === user.acctId) || null
  );
  const [isActive, setIsActive] = useState(user.isActive);

  async function handleSubmit(formData: FormData) {
    formData.set("isActive", String(isActive));
    startTransition(async () => {
      await updateUser(user.id, formData);
    });
  }

  return (
    <Card className="overflow-hidden border-border shadow-sm">
      <div className="h-1 w-full bg-primary" />

      <CardHeader className="pb-4 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <UserCog className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
                Edit User
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {user.contactFirstName} {user.contactLastName}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={isActive ? "default" : "secondary"}
            className={isActive
              ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/10"
              : ""}
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6">
        <form action={handleSubmit} className="space-y-8">

          {/* Organization */}
          <FieldGroup icon={Building2} title="Organization">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium text-foreground/80">Organization</Label>
              <Select
                defaultValue={String(user.acctId)}
                onValueChange={(value) => {
                  const company = companies.find((c) => c.id === Number(value)) || null;
                  setSelectedCompany(company);
                }}
              >
                <SelectTrigger className="border-border focus:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={String(company.id)}>
                      {company.organization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="acctId" value={selectedCompany?.id || ""} />
            </div>
          </FieldGroup>

          <Separator className="bg-border/60" />

          {/* Address */}
          <FieldGroup icon={MapPin} title="Address (from organization)">
            <Field label="Street">
              <Input value={selectedCompany?.street ?? ""} readOnly
                className="border-border bg-muted/40 text-muted-foreground focus-visible:ring-0 cursor-default" />
            </Field>
            <Field label="City">
              <Input value={selectedCompany?.city ?? ""} readOnly
                className="border-border bg-muted/40 text-muted-foreground focus-visible:ring-0 cursor-default" />
            </Field>
            <Field label="State">
              <Input value={selectedCompany?.state ?? ""} readOnly
                className="border-border bg-muted/40 text-muted-foreground focus-visible:ring-0 cursor-default" />
            </Field>
            <Field label="Zip">
              <Input value={selectedCompany?.zip ?? ""} readOnly
                className="border-border bg-muted/40 text-muted-foreground focus-visible:ring-0 cursor-default" />
            </Field>
          </FieldGroup>

          <Separator className="bg-border/60" />

          {/* Contact */}
          <FieldGroup icon={UserCog} title="Contact Details">
            <Field label="First Name" required>
              <Input name="firstName" defaultValue={user.contactFirstName} required
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Last Name" required>
              <Input name="lastName" defaultValue={user.contactLastName} required
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Email" required>
              <Input type="email" name="email" defaultValue={user.contactEmail} required
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Phone" required>
              <Input name="phone" defaultValue={user.contactPhone} required
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Title" full>
              <Input name="title" defaultValue={user.contactTitle ?? ""}
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
          </FieldGroup>

          <Separator className="bg-border/60" />

          {/* Role & Status */}
          <FieldGroup icon={ShieldCheck} title="Access & Status">
            <Field label="Role" required>
              <Select name="role" defaultValue={user.userRole}>
                <SelectTrigger className="border-border focus:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground/80">
                Account Status
              </Label>
              <div className="flex h-10 items-center gap-3">
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  className="data-[state=checked]:bg-primary"
                />
                <span className="text-sm text-muted-foreground">
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </FieldGroup>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="min-w-35 bg-primary text-primary-foreground hover:bg-[#0D6B60] transition-colors"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Saving…
                </span>
              ) : "Save Changes"}
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}