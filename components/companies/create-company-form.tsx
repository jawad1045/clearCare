"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, MapPin, User, FileText, X , Trash2} from "lucide-react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { createCompany } from "@/action/company.action";
import { createCompanyTitle, deleteCompanyTitle } from "@/action/company-title.action";
import { lookupZipCode, formatPhoneInput } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/locale/use-translation";

// const TITLES = ["Administrator", "Manager", "Counselor", "Nurse", "Doctor"] as const;
// const TITLE_LABEL_KEYS = {
//   Administrator: "common.titleAdministrator",
//   Manager: "common.titleManager",
//   Counselor: "common.titleCounselor",
//   Nurse: "common.titleNurse",
//   Doctor: "common.titleDoctor",
// } as const;

const ADD_CUSTOM_TITLE_VALUE = "__add_custom__";
interface CustomTitle {
  id: number;   // ← fixed
  name: string;
}

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

interface CreateCompanyFormProps {
  initialCustomTitles?: CustomTitle[];
}

export function CreateCompanyForm({ initialCustomTitles = [] }: CreateCompanyFormProps) {
  const { t } = useTranslation();
  const companySchema = useCompanySchema(t);
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<CompanyFormValues | null>(null);

  // Custom title state (DB-backed)
  const [customTitles, setCustomTitles] = useState<CustomTitle[]>(initialCustomTitles);
  const [isAddingTitle, setIsAddingTitle] = useState(false);
  const [newTitleInput, setNewTitleInput] = useState("");
  const [titleToDelete, setTitleToDelete] = useState<CustomTitle | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [isTitlePending, startTitleTransition] = useTransition();

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
      organization: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      title: "",
      notes: "",
    },
  });

  const zip = watch("zip") ?? "";
  const selectedTitle = watch("title") ?? "";

  const allTitleNames = useMemo(
    () => [ ...customTitles.map((c) => c.name)],
    [customTitles]
  );

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

  function handleAddCustomTitle() {
    const trimmed = newTitleInput.trim();
    setTitleError(null);
    if (!trimmed) return;
    if (allTitleNames.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      setTitleError(t("common.titleAlreadyExists"));
      return;
    }

    startTitleTransition(async () => {
      const result = await createCompanyTitle(trimmed);
      if (result.error || !result.data) {
        setTitleError(result.error ?? t("common.somethingWentWrong"));
        return;
      }
      setCustomTitles((prev) => [...prev, result.data]);
      setValue("title", result.data.name, { shouldValidate: true });
      setNewTitleInput("");
      setIsAddingTitle(false);
    });
  }

  function handleDeleteCustomTitle(title: CustomTitle) {
    const previous = customTitles;
    // optimistic removal
    setCustomTitles((prev) => prev.filter((c) => c.id !== title.id));
    if (selectedTitle === title.name) {
      setValue("title", "", { shouldValidate: true });
    }
    setTitleToDelete(null);

    startTitleTransition(async () => {
      const result = await deleteCompanyTitle(title.id);
      if (result.error) {
        // roll back on failure
        setCustomTitles(previous);
      }
    });
  }

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
      await createCompany(formData);
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

  return (
    <Card className="overflow-hidden border-border shadow-sm">
      <div className="h-1 w-full bg-primary" />

      <CardHeader className="pb-4 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
              {t("companies.createTitle")}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {t("companies.createSubtitle")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6">
        <ConfirmDialog
          open={confirmOpen}
          onConfirm={onConfirm}
          onCancel={() => { setConfirmOpen(false); setPendingValues(null); }}
          title={t("companies.createConfirmTitle")}
          description={t("companies.createConfirmDescription")}
          confirmLabel={t("companies.createTitle")}
        />

        <ConfirmDialog
          open={titleToDelete !== null}
          onConfirm={() => titleToDelete && handleDeleteCustomTitle(titleToDelete)}
          onCancel={() => setTitleToDelete(null)}
          title={t("common.deleteTitleConfirmTitle")}
          description={
            titleToDelete
              ? `${t("common.deleteTitleConfirmDescription")} "${titleToDelete.name}"?`
              : t("common.deleteTitleConfirmDescription")
          }
          confirmLabel={t("common.delete")}
        />

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">

          <FieldGroup icon={Building2} title={t("common.organization")}>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium text-foreground/80">
                {t("common.organizationName")}<span className="ml-0.5 text-primary">*</span>
              </Label>
              <Input
                {...register("organization")}
                placeholder={t("companies.orgPlaceholder")}
                className="border-border bg-background focus-visible:ring-primary"
              />
              {errors.organization && (
                <p className="text-xs text-destructive">{errors.organization.message}</p>
              )}
            </div>
          </FieldGroup>

          <Separator className="bg-border/60" />

          <FieldGroup icon={MapPin} title={t("common.address")}>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium text-foreground/80">{t("common.street")}</Label>
              <Input
                {...register("street")}
                placeholder={t("companies.streetPlaceholder")}
                className="border-border bg-background focus-visible:ring-primary"
              />
            </div>
            <Field label={t("common.zip")}>
              <Input
                value={zip}
                onChange={(e) => handleZipChange(e.target.value)}
                placeholder={t("companies.zipPlaceholder")}
                maxLength={5}
                inputMode="numeric"
                className="border-border bg-background focus-visible:ring-primary"
              />
            </Field>
            <Field label={t("common.city")} required error={errors.city?.message}>
              <Input
                {...register("city")}
                placeholder={t("companies.cityPlaceholder")}
                className="border-border bg-background focus-visible:ring-primary"
              />
            </Field>
            <Field label={t("common.state")} required error={errors.state?.message}>
              <Input
                {...register("state")}
                placeholder={t("companies.statePlaceholder")}
                className="border-border bg-background focus-visible:ring-primary"
              />
            </Field>
          </FieldGroup>

          <Separator className="bg-border/60" />

          <FieldGroup icon={User} title={t("common.contactPerson")}>
            <Field label={t("common.firstName")} required error={errors.firstName?.message}>
              <Input {...register("firstName")} placeholder={t("companies.firstNamePlaceholder")}
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label={t("common.lastName")} required error={errors.lastName?.message}>
              <Input {...register("lastName")} placeholder={t("companies.lastNamePlaceholder")}
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label={t("common.email")} required error={errors.email?.message}>
              <Input {...register("email")} type="email" placeholder={t("companies.emailPlaceholder")}
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label={t("common.phone")} required error={errors.phone?.message}>
              <Input
                {...register("phone", {
                  onChange: (e) => { e.target.value = formatPhoneInput(e.target.value); },
                })}
                placeholder={t("companies.phonePlaceholder")}
                maxLength={14}
                className="border-border bg-background focus-visible:ring-primary"
              />
            </Field>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground/80">{t("common.title")}</Label>

              {isAddingTitle ? (
                <div className="space-y-1">
                  <div className="flex gap-2">
                    <Input
                      autoFocus
                      value={newTitleInput}
                      disabled={isTitlePending}
                      onChange={(e) => { setNewTitleInput(e.target.value); setTitleError(null); }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomTitle();
                        }
                        if (e.key === "Escape") {
                          setIsAddingTitle(false);
                          setNewTitleInput("");
                          setTitleError(null);
                        }
                      }}
                      placeholder={t("companies.customTitlePlaceholder")}
                      className="border-border bg-background focus-visible:ring-primary"
                    />
                    <Button type="button" size="sm" onClick={handleAddCustomTitle} disabled={isTitlePending}>
                      {isTitlePending ? t("common.saving") : t("common.add")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={isTitlePending}
                      onClick={() => { setIsAddingTitle(false); setNewTitleInput(""); setTitleError(null); }}
                    >
                      {t("common.cancel")}
                    </Button>
                  </div>
                  {titleError && <p className="text-xs text-destructive">{titleError}</p>}
                </div>
              ) : (
                <Select
                  value={selectedTitle || undefined}
                  onValueChange={(v) => {
                    if (v === ADD_CUSTOM_TITLE_VALUE) {
                      setIsAddingTitle(true);
                      return;
                    }
                    setValue("title", v, { shouldValidate: true });
                  }}
                >
                  <SelectTrigger className="w-full border-border bg-background focus:ring-primary">
                    <SelectValue placeholder={t("common.selectTitlePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {/* {TITLES.map((title) => (
                      <SelectItem key={title} value={title}>
                        {t(TITLE_LABEL_KEYS[title])}
                      </SelectItem>
                    ))} */}
                   {customTitles.map((title) => (
  <SelectItem
    key={title.id}
    value={title.name}
    className="group relative pr-8 group-hover:[&>span:first-child]:opacity-0 [&>span:first-child]:transition-opacity"
  >
    <span className="flex-1">{title.name}</span>
    <button
  type="button"
  aria-label={t("common.delete")}
  onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
  onPointerUp={(e) => { e.stopPropagation(); e.preventDefault(); }}
  onClick={(e) => {
    e.stopPropagation();
    e.preventDefault();
    setTitleToDelete(title);
  }}
  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
>
  <Trash2 className="h-3.5 w-3.5" />
</button>
  </SelectItem>
))}

                    <SelectItem value={ADD_CUSTOM_TITLE_VALUE} className="font-medium text-primary">
                      + {t("common.addCustomTitle")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </FieldGroup>

          <Separator className="bg-border/60" />

          <FieldGroup icon={FileText} title={t("common.notes")}>
            <div className="space-y-1.5 sm:col-span-2">
              <Textarea
                {...register("notes")}
                placeholder={t("companies.notesPlaceholder")}
                rows={4}
                className="resize-none border-border bg-background focus-visible:ring-primary"
              />
            </div>
          </FieldGroup>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="min-w-35 px-6 py-2.5 bg-primary text-primary-foreground hover:bg-[#0D6B60] transition-colors"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  {t("common.creating")}
                </span>
              ) : t("companies.createTitle")}
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}