"use client";

import { useState, useTransition } from "react";
import { UserCog, Building2, MapPin, ShieldCheck, ToggleLeft } from "lucide-react";

import { updateUser } from "@/action/user.action";
import { formatPhoneInput } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/locale/use-translation";

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
  acctId: number | null;
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

const TITLES = ["Administrator", "Manager", "Counselor", "Nurse", "Doctor"] as const;
const TITLE_LABEL_KEYS = {
  Administrator: "common.titleAdministrator",
  Manager: "common.titleManager",
  Counselor: "common.titleCounselor",
  Nurse: "common.titleNurse",
  Doctor: "common.titleDoctor",
} as const;

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
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [selectedRole, setSelectedRole] = useState<string>(user.userRole);
  const [selectedCompany, setSelectedCompany] = useState(
    companies.find((c) => c.id === user.acctId) || null
  );
  const [isActive, setIsActive] = useState(user.isActive);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingData, setPendingData] = useState<FormData | null>(null);
  const [companyError, setCompanyError] = useState<string | null>(null);
  const [phone, setPhone] = useState(formatPhoneInput(user.contactPhone));
  const [contactTitle, setContactTitle] = useState(user.contactTitle ?? "");

  function handleRoleChange(value: string) {
    setSelectedRole(value);
    setCompanyError(null);
  }

  async function handleSubmit(formData: FormData) {
    formData.set("isActive", String(isActive));
    startTransition(async () => {
      await updateUser(user.id, formData);
    });
  }

  function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selectedRole !== "Admin" && !selectedCompany) {
      setCompanyError(t("users.orgRequiredForRole"));
      return;
    }
    setCompanyError(null);
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
      <div className="h-1 w-full bg-primary" />

      <CardHeader className="pb-4 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <UserCog className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
                {t("users.editTitle")}
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
            {isActive ? t("common.active") : t("common.inactive")}
          </Badge>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6">
        <ConfirmDialog
          open={confirmOpen}
          onConfirm={onConfirm}
          onCancel={() => { setConfirmOpen(false); setPendingData(null); }}
          title={t("common.saveChanges")}
          description={t("users.editConfirmDescription")}
          confirmLabel={t("common.saveChanges")}
        />
        <form onSubmit={onFormSubmit} className="space-y-8">

          {/* Organization */}
          <FieldGroup icon={Building2} title={t("common.organization")}>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium text-foreground/80">
                {t("common.organization")}
                {selectedRole !== "Admin"
                  ? <span className="ml-0.5 text-primary">*</span>
                  : <span className="ml-1 text-xs text-muted-foreground">{t("users.optionalForAdmin")}</span>
                }
              </Label>
              <Select
                defaultValue={user.acctId ? String(user.acctId) : undefined}
                onValueChange={(value) => {
                  const company = companies.find((c) => c.id === Number(value)) || null;
                  setSelectedCompany(company);
                  setCompanyError(null);
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
              {companyError && (
                <p className="text-xs text-destructive">{companyError}</p>
              )}
            </div>
          </FieldGroup>

          <Separator className="bg-border/60" />

          {/* Address */}
          <FieldGroup icon={MapPin} title={t("users.addressFromOrg")}>
            <Field label={t("common.street")}>
              <Input value={selectedCompany?.street ?? ""} readOnly
                className="border-border bg-muted/40 text-muted-foreground focus-visible:ring-0 cursor-default" />
            </Field>
            <Field label={t("common.city")}>
              <Input value={selectedCompany?.city ?? ""} readOnly
                className="border-border bg-muted/40 text-muted-foreground focus-visible:ring-0 cursor-default" />
            </Field>
            <Field label={t("common.state")}>
              <Input value={selectedCompany?.state ?? ""} readOnly
                className="border-border bg-muted/40 text-muted-foreground focus-visible:ring-0 cursor-default" />
            </Field>
            <Field label={t("common.zip")}>
              <Input value={selectedCompany?.zip ?? ""} readOnly
                className="border-border bg-muted/40 text-muted-foreground focus-visible:ring-0 cursor-default" />
            </Field>
          </FieldGroup>

          <Separator className="bg-border/60" />

          {/* Contact */}
          <FieldGroup icon={UserCog} title={t("users.contactDetails")}>
            <Field label={t("common.firstName")} required>
              <Input name="firstName" defaultValue={user.contactFirstName} required
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label={t("common.lastName")} required>
              <Input name="lastName" defaultValue={user.contactLastName} required
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label={t("common.email")} required>
              <Input type="email" name="email" defaultValue={user.contactEmail} required
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label={t("common.phone")} required>
              <Input
                name="phone"
                value={phone}
                onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                required
                maxLength={14}
                className="border-border bg-background focus-visible:ring-primary"
              />
            </Field>
            <Field label={t("common.title")} full>
              <Select defaultValue={contactTitle || undefined} onValueChange={setContactTitle}>
                <SelectTrigger className="border-border focus:ring-primary">
                  <SelectValue placeholder={t("common.selectTitlePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {TITLES.map((title) => (
                    <SelectItem key={title} value={title}>{t(TITLE_LABEL_KEYS[title])}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="title" value={contactTitle} />
            </Field>
          </FieldGroup>

          <Separator className="bg-border/60" />

          {/* Role & Status */}
          <FieldGroup icon={ShieldCheck} title={t("users.accessAndStatus")}>
            <Field label={t("common.role")} required>
              <Select defaultValue={user.userRole} onValueChange={handleRoleChange}>
                <SelectTrigger className="border-border focus:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">{t("common.roleAdmin")}</SelectItem>
                  <SelectItem value="User">{t("common.roleUser")}</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="role" value={selectedRole} />
            </Field>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground/80">
                {t("users.accountStatus")}
              </Label>
              <div className="flex h-10 items-center gap-3">
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  className="data-[state=checked]:bg-primary"
                />
                <span className="text-sm text-muted-foreground">
                  {isActive ? t("common.active") : t("common.inactive")}
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
                  {t("common.saving")}
                </span>
              ) : t("common.saveChanges")}
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}