"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, MapPin, User, FileText, CheckCircle2, XCircle } from "lucide-react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { updateCompany, toggleCompanyStatus } from "@/action/company.action";
import { lookupZipCode, formatPhoneInput } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/locale/use-translation";

const TITLES = ["Administrator", "Manager", "Counselor", "Nurse", "Doctor"] as const;
const TITLE_LABEL_KEYS = {
  Administrator: "common.titleAdministrator",
  Manager: "common.titleManager",
  Counselor: "common.titleCounselor",
  Nurse: "common.titleNurse",
  Doctor: "common.titleDoctor",
} as const;

type Company = {
  id: number;
  organization: string;
  street: string | null;
  city: string;
  state: string;
  zip: string | null;
  contactPhone: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactTitle: string | null;
  notes: string | null;
  isActive: boolean; // NEW
};

type Props = { company: Company };

function useCompanySchema(t: ReturnType<typeof useTranslation>["t"]) {
  return useMemo(
    () =>
      z.object({
        organization: z.string().min(1, t("common.validation.organizationRequired")),
        street: z.string().optional(),
        city: z.string().min(1, t("common.validation.cityRequired")),
        state: z.string().min(1, t("common.validation.stateRequired")),
        zip: z.string().optional(),
        firstName: z.string().min(1, t("common.validation.firstNameRequired")),
        lastName: z.string().min(1, t("common.validation.lastNameRequired")),
        email: z.string().min(1, t("common.validation.emailRequired")).email(t("common.validation.emailInvalid")),
        phone: z
          .string()
          .min(1, t("common.validation.phoneRequired"))
          .regex(/^\(\d{3}\) \d{3}-\d{4}$/, t("common.validation.phoneInvalid")),
        title: z.string().optional(),
        notes: z.string().optional(),
      }),
    [t]
  );
}

type CompanyFormValues = z.infer<ReturnType<typeof useCompanySchema>>;

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

function Field({ label, required, error, children }: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-foreground/80">
        {label}
        {required && <span className="ml-0.5 text-primary">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function EditCompanyForm({ company }: Props) {
  const { t } = useTranslation();
  const companySchema = useCompanySchema(t);
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<CompanyFormValues | null>(null);

  // Active / Inactive status (separate from the main field form — cascades to users)
  const [isActive, setIsActive] = useState(company.isActive);
  const [pendingActive, setPendingActive] = useState<boolean | null>(null);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [isStatusPending, startStatusTransition] = useTransition();

  const zipLookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      organization: company.organization,
      street: company.street ?? "",
      city: company.city,
      state: company.state,
      zip: company.zip ?? "",
      firstName: company.contactFirstName,
      lastName: company.contactLastName,
      email: company.contactEmail,
      phone: formatPhoneInput(company.contactPhone),
      title: company.contactTitle ?? "",
      notes: company.notes ?? "",
    },
  });

  const zip = watch("zip") ?? "";

  function handleZipChange(value: string) {
    setValue("zip", value);
    if (zipLookupTimer.current) clearTimeout(zipLookupTimer.current);
    if (!/^\d{5}$/.test(value)) return;
    zipLookupTimer.current = setTimeout(async () => {
      const result = await lookupZipCode(value);
      if (result) {
        setValue("city", result.city, { shouldValidate: true });
        setValue("state", result.state, { shouldValidate: true });
      }
    }, 400);
  }

  useEffect(() => {
    return () => {
      if (zipLookupTimer.current) clearTimeout(zipLookupTimer.current);
    };
  }, []);

  async function submitCompany(values: CompanyFormValues) {
    const formData = new FormData();
    formData.set("organization", values.organization);
    formData.set("street", values.street ?? "");
    formData.set("city", values.city);
    formData.set("state", values.state);
    formData.set("zip", values.zip ?? "");
    formData.set("phone", values.phone);
    formData.set("firstName", values.firstName);
    formData.set("lastName", values.lastName);
    formData.set("email", values.email);
    formData.set("title", values.title ?? "");
    formData.set("notes", values.notes ?? "");

    startTransition(async () => {
      await updateCompany(company.id, formData);
    });
  }

  function onFormSubmit(values: CompanyFormValues) {
    setPendingValues(values);
    setConfirmOpen(true);
  }

  function onConfirm() {
    setConfirmOpen(false);
    if (pendingValues) submitCompany(pendingValues);
    setPendingValues(null);
  }

  // Status switch handlers
  function handleStatusSwitchChange(checked: boolean) {
    setPendingActive(checked);
    setStatusConfirmOpen(true);
  }

  function onStatusConfirm() {
    if (pendingActive === null) return;
    const nextActive = pendingActive;
    setStatusConfirmOpen(false);

    startStatusTransition(async () => {
      await toggleCompanyStatus(company.id, nextActive);
      setIsActive(nextActive);
      setPendingActive(null);
    });
  }

  function onStatusCancel() {
    setStatusConfirmOpen(false);
    setPendingActive(null);
  }

  return (
    <Card className="overflow-hidden border-border shadow-sm">
      <div className={`h-1 w-full ${isActive ? "bg-primary" : "bg-muted-foreground/40"}`} />

      <CardHeader className="pb-4 pt-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
                  {t("companies.editTitle")}
                </CardTitle>
                <Badge
                  variant={isActive ? "default" : "secondary"}
                  className={isActive ? "gap-1 bg-primary/10 text-primary" : "gap-1 bg-muted text-muted-foreground"}
                >
                  {isActive ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {isActive ? t("common.active") : t("common.inactive")}
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                {t("companies.editSubtitle")}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="company-active-switch" className="text-xs font-medium text-foreground/80">
              {isActive ? t("common.active") : t("common.inactive")}
            </Label>
            <Switch
              id="company-active-switch"
              checked={isActive}
              disabled={isStatusPending}
              onCheckedChange={handleStatusSwitchChange}
            />
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6">
        <ConfirmDialog
          open={confirmOpen}
          onConfirm={onConfirm}
          onCancel={() => { setConfirmOpen(false); setPendingValues(null); }}
          title={t("common.saveChanges")}
          description={t("companies.editConfirmDescription")}
          confirmLabel={t("common.saveChanges")}
        />

        <ConfirmDialog
          open={statusConfirmOpen}
          onConfirm={onStatusConfirm}
          onCancel={onStatusCancel}
          title={pendingActive ? t("companies.activateConfirmTitle") : t("companies.deactivateConfirmTitle")}
          description={
            pendingActive
              ? t("companies.activateConfirmDescription")
              : t("companies.deactivateConfirmDescription")
          }
          confirmLabel={pendingActive ? t("common.activate") : t("common.deactivate")}
        />

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">

          {/* Organization */}
          <FieldGroup icon={Building2} title={t("common.organization")}>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium text-foreground/80">
                {t("common.organizationName")}<span className="ml-0.5 text-primary">*</span>
              </Label>
              <Input
                {...register("organization")}
                className="border-border bg-background focus-visible:ring-primary"
              />
              {errors.organization && (
                <p className="text-xs text-destructive">{errors.organization.message}</p>
              )}
            </div>
          </FieldGroup>

          <Separator className="bg-border/60" />

          {/* Address */}
          <FieldGroup icon={MapPin} title={t("common.address")}>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium text-foreground/80">{t("common.street")}</Label>
              <Input {...register("street")}
                className="border-border bg-background focus-visible:ring-primary" />
            </div>
            <Field label={t("common.zip")}>
              <Input
                value={zip}
                onChange={(e) => handleZipChange(e.target.value)}
                maxLength={5}
                inputMode="numeric"
                className="border-border bg-background focus-visible:ring-primary"
              />
            </Field>
            <Field label={t("common.city")} required error={errors.city?.message}>
              <Input {...register("city")}
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label={t("common.state")} required error={errors.state?.message}>
              <Input {...register("state")}
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
          </FieldGroup>

          <Separator className="bg-border/60" />

          {/* Contact */}
          <FieldGroup icon={User} title={t("common.contactPerson")}>
            <Field label={t("common.firstName")} required error={errors.firstName?.message}>
              <Input {...register("firstName")}
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label={t("common.lastName")} required error={errors.lastName?.message}>
              <Input {...register("lastName")}
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label={t("common.email")} required error={errors.email?.message}>
              <Input type="email" {...register("email")}
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label={t("common.phone")} required error={errors.phone?.message}>
              <Input
                {...register("phone", {
                  onChange: (e) => { e.target.value = formatPhoneInput(e.target.value); },
                })}
                maxLength={14}
                className="border-border bg-background focus-visible:ring-primary"
              />
            </Field>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium text-foreground/80">{t("common.title")}</Label>
              <Select
                defaultValue={company.contactTitle ?? undefined}
                onValueChange={(v) => setValue("title", v)}
              >
                <SelectTrigger className="w-full border-border bg-background focus:ring-primary">
                  <SelectValue placeholder={t("common.selectTitlePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {TITLES.map((title) => (
                    <SelectItem key={title} value={title}>{t(TITLE_LABEL_KEYS[title])}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FieldGroup>

          <Separator className="bg-border/60" />

          {/* Notes */}
          <FieldGroup icon={FileText} title={t("common.notes")}>
            <div className="space-y-1.5 sm:col-span-2">
              <Textarea
                {...register("notes")}
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