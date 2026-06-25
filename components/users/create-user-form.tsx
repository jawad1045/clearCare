"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserPlus, Building2, MapPin, ShieldCheck, FileText } from "lucide-react";

import { createUser } from "@/action/user.action";
import { formatPhoneInput } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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

type CreateUserFormProps = { companies: Company[] };

const TITLES = ["Administrator", "Manager", "Counselor", "Nurse", "Doctor"];

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

function Field({ label, required, children, full }: {
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

export function CreateUserForm({ companies }: CreateUserFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("User");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingData, setPendingData] = useState<FormData | null>(null);
  const [companyError, setCompanyError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");

  function handleRoleChange(value: string) {
    setSelectedRole(value);
    setSelectedCompany(null);
    setCompanyError(null);
  }

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createUser(formData);
      router.push("/admin/users");
      router.refresh();
    });
  }

  function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const role = formData.get("role") as string;
    const acctId = formData.get("acctId") as string;
    if (role !== "Admin" && !acctId) {
      setCompanyError("Organization is required for this role.");
      return;
    }
    setCompanyError(null);
    setPendingData(formData);
    setConfirmOpen(true);
  }

  function onConfirm() {
    setConfirmOpen(false);
    if (pendingData) handleSubmit(pendingData);
    setPendingData(null);
  }

  return (
    <Card className="overflow-hidden border-border shadow-sm">
      <div className="h-1 w-full bg-primary" />

      <CardHeader className="pb-4 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
              Create User
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Add a new user and assign them to an organization
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
          title="Create User"
          description="Are you sure you want to create this user? Please review all details before proceeding."
          confirmLabel="Create User"
        />
        <form onSubmit={onFormSubmit} className="space-y-8">

          {/* Organization */}
          <FieldGroup icon={Building2} title="Organization">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium text-foreground/80">
                Organization
                {selectedRole !== "Admin"
                  ? <span className="ml-0.5 text-primary">*</span>
                  : <span className="ml-1 text-xs text-muted-foreground">(optional for Admin)</span>
                }
              </Label>
              <Select
                key={selectedRole}
                onValueChange={(value) => {
                  const company = companies.find((c) => c.id === Number(value)) || null;
                  setSelectedCompany(company);
                  setCompanyError(null);
                }}
              >
                <SelectTrigger className="border-border focus:ring-primary">
                  <SelectValue placeholder="Select organization…" />
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
              {companyError && (
                <p className="text-xs text-destructive">{companyError}</p>
              )}
            </div>
          </FieldGroup>

          {/* Address — read-only derived from company */}
          {selectedCompany && (
            <>
              <Separator className="bg-border/60" />
              <FieldGroup icon={MapPin} title="Address (from organization)">
                <Field label="Street">
                  <Input value={selectedCompany.street ?? ""} readOnly
                    className="border-border bg-muted/40 text-muted-foreground focus-visible:ring-0 cursor-default" />
                </Field>
                <Field label="City">
                  <Input value={selectedCompany.city ?? ""} readOnly
                    className="border-border bg-muted/40 text-muted-foreground focus-visible:ring-0 cursor-default" />
                </Field>
                <Field label="State">
                  <Input value={selectedCompany.state ?? ""} readOnly
                    className="border-border bg-muted/40 text-muted-foreground focus-visible:ring-0 cursor-default" />
                </Field>
                <Field label="Zip">
                  <Input value={selectedCompany.zip ?? ""} readOnly
                    className="border-border bg-muted/40 text-muted-foreground focus-visible:ring-0 cursor-default" />
                </Field>
              </FieldGroup>
            </>
          )}

          <Separator className="bg-border/60" />

          {/* Contact */}
          <FieldGroup icon={UserPlus} title="Contact Details">
            <Field label="First Name" required>
              <Input name="firstName" required
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Last Name" required>
              <Input name="lastName" required
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Email" required>
              <Input type="email" name="email" required
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Phone" required>
              <Input
                name="phone"
                value={phone}
                onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                required
                maxLength={14}
                className="border-border bg-background focus-visible:ring-primary"
              />
            </Field>
            <Field label="Title" full>
              <Select onValueChange={setTitle}>
                <SelectTrigger className="border-border focus:ring-primary">
                  <SelectValue placeholder="Select title..." />
                </SelectTrigger>
                <SelectContent>
                  {TITLES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="title" value={title} />
            </Field>
          </FieldGroup>

          <Separator className="bg-border/60" />

          {/* Role & Password */}
          <FieldGroup icon={ShieldCheck} title="Access & Security">
            <Field label="Role" required>
              <Select defaultValue="User" onValueChange={handleRoleChange}>
                <SelectTrigger className="border-border focus:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="role" value={selectedRole} />
            </Field>

            <div /> {/* spacer */}

            <Field label="Password" required>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  className="border-border bg-background pr-10 focus-visible:ring-primary"
                />
                <Button
                  type="button" variant="ghost" size="icon"
                  className="absolute right-0 top-0 h-full text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </Field>

            <Field label="Confirm Password" required>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  className="border-border bg-background pr-10 focus-visible:ring-primary"
                />
                <Button
                  type="button" variant="ghost" size="icon"
                  className="absolute right-0 top-0 h-full text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </Field>
          </FieldGroup>

          <Separator className="bg-border/60" />

          {/* Notes */}
          <FieldGroup icon={FileText} title="Notes">
            <div className="space-y-1.5 sm:col-span-2">
              <Textarea
                name="notes"
                placeholder="Any additional notes about this user…"
                rows={4}
                className="resize-none border-border bg-background focus-visible:ring-primary"
              />
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
                  Creating…
                </span>
              ) : "Create User"}
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}