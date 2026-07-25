"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound, UserPlus, Building2, MapPin, ShieldCheck, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { createUser } from "@/action/user.action";
import { createUserTitle, deleteUserTitle } from "@/action/user-title.action";
import { isRedirectError } from "next/dist/client/components/redirect-error";
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
import { useTranslation } from "@/locale/use-translation";

type Company = {
  id: number;
  organization: string;
  street: string | null;
  city: string;
  state: string;
  zip: string | null;
};

interface CustomTitle {
  id: number;
  name: string;
}

type CreateUserFormProps = {
  companies: Company[];
  initialCustomTitles?: CustomTitle[];
};

const ADD_CUSTOM_TITLE_VALUE = "__add_custom__";

function useUserSchema(t: ReturnType<typeof useTranslation>["t"]) {
  return useMemo(
    () =>
      z
        .object({
          acctId: z.string().optional(),
          firstName: z.string().min(1, t("common.validation.firstNameRequired")),
          lastName: z.string().min(1, t("common.validation.lastNameRequired")),
          email: z.string().min(1, t("common.validation.emailRequired")).email(t("common.validation.emailInvalid")),
          phone: z
            .string()
            .min(1, t("common.validation.phoneRequired"))
            .regex(/^\(\d{3}\) \d{3}-\d{4}$/, t("common.validation.phoneInvalid")),
          title: z.string().optional(),
          role: z.string().min(1, t("common.validation.roleRequired")),
          notes: z.string().optional(),
        })
        .superRefine((data, ctx) => {
          if (data.role !== "Admin" && !data.acctId) {
            ctx.addIssue({
              code: "custom",
              path: ["acctId"],
              message: t("users.orgRequiredForRole"),
            });
          }
        }),
    [t]
  );
}

type UserFormValues = z.infer<ReturnType<typeof useUserSchema>>;

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

function Field({ label, required, error, children, full }: {
  label: string;
  required?: boolean;
  error?: string;
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
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function CreateUserForm({ companies, initialCustomTitles = [] }: CreateUserFormProps) {
  const { t } = useTranslation();
  const userSchema = useUserSchema(t);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<UserFormValues | null>(null);

  // Custom title state (DB-backed, shared with CreateCompanyForm)
  const [customTitles, setCustomTitles] = useState<CustomTitle[]>(initialCustomTitles);
  const [isAddingTitle, setIsAddingTitle] = useState(false);
  const [newTitleInput, setNewTitleInput] = useState("");
  const [titleToDelete, setTitleToDelete] = useState<CustomTitle | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [isTitlePending, startTitleTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      acctId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      title: "",
      role: "User",
      notes: "",
    },
  });

  const role = watch("role");
  const selectedTitle = watch("title") ?? "";

  const allTitleNames = useMemo(
    () => customTitles.map((c) => c.name),
    [customTitles]
  );

  function handleRoleChange(value: string) {
    setValue("role", value, { shouldValidate: true });
    setValue("acctId", "");
    setSelectedCompany(null);
  }

  function handleAddCustomTitle() {
    const trimmed = newTitleInput.trim();
    setTitleError(null);
    if (!trimmed) return;
    if (allTitleNames.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      setTitleError(t("common.titleAlreadyExists"));
      return;
    }

    startTitleTransition(async () => {
      const result = await createUserTitle(trimmed);
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
    setCustomTitles((prev) => prev.filter((c) => c.id !== title.id));
    if (selectedTitle === title.name) {
      setValue("title", "", { shouldValidate: true });
    }
    setTitleToDelete(null);

    startTitleTransition(async () => {
      const result = await deleteUserTitle(title.id);
      if (result.error) {
        setCustomTitles(previous);
      }
    });
  }

  async function submitUser(values: UserFormValues) {
    const formData = new FormData();
    formData.set("acctId", values.acctId ?? "");
    formData.set("firstName", values.firstName);
    formData.set("lastName", values.lastName);
    formData.set("email", values.email);
    formData.set("phone", values.phone);
    formData.set("title", values.title ?? "");
    formData.set("role", values.role);
    formData.set("notes", values.notes ?? "");

    startTransition(async () => {
      try {
        await createUser(formData);
        router.push("/admin/users");
        router.refresh();
      } catch (error) {
        if (isRedirectError(error)) throw error;
        toast.error(error instanceof Error ? error.message : t("users.createUserFailed"));
      }
    });
  }

  function onFormSubmit(values: UserFormValues) {
    setPendingValues(values);
    setConfirmOpen(true);
  }

  function onConfirm() {
    setConfirmOpen(false);
    if (pendingValues) submitUser(pendingValues);
    setPendingValues(null);
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
              {t("users.createUser")}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {t("users.createSubtitle")}
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
          title={t("users.createUser")}
          description={t("users.createConfirmDescription")}
          confirmLabel={t("users.createUser")}
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

          {/* Organization */}
          <FieldGroup icon={Building2} title={t("common.organization")}>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground/80">
                {t("common.organization")}
                {role !== "Admin"
                  ? <span className="ml-0.5 text-primary">*</span>
                  : <span className="ml-1 text-xs text-muted-foreground">{t("users.optionalForAdmin")}</span>
                }
              </Label>
              <Select
                key={role}
                onValueChange={(value) => {
                  const company = companies.find((c) => c.id === Number(value)) || null;
                  setSelectedCompany(company);
                  setValue("acctId", value, { shouldValidate: true });
                }}
              >
                <SelectTrigger className="w-full border-border focus:ring-primary">
                  <SelectValue placeholder={t("users.selectOrgPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={String(company.id)}>
                      {company.organization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.acctId && (
                <p className="text-xs text-destructive">{errors.acctId.message}</p>
              )}
            </div>
          </FieldGroup>

          {/* Address — read-only derived from company */}
          {selectedCompany && (
            <>
              <Separator className="bg-border/60" />
              <FieldGroup icon={MapPin} title={t("users.addressFromOrg")}>
                <Field label={t("common.street")}>
                  <Input value={selectedCompany.street ?? ""} readOnly
                    className="border-border bg-muted/40 text-muted-foreground focus-visible:ring-0 cursor-default" />
                </Field>
                <Field label={t("common.city")}>
                  <Input value={selectedCompany.city ?? ""} readOnly
                    className="border-border bg-muted/40 text-muted-foreground focus-visible:ring-0 cursor-default" />
                </Field>
                <Field label={t("common.state")}>
                  <Input value={selectedCompany.state ?? ""} readOnly
                    className="border-border bg-muted/40 text-muted-foreground focus-visible:ring-0 cursor-default" />
                </Field>
                <Field label={t("common.zip")}>
                  <Input value={selectedCompany.zip ?? ""} readOnly
                    className="border-border bg-muted/40 text-muted-foreground focus-visible:ring-0 cursor-default" />
                </Field>
              </FieldGroup>
            </>
          )}

          <Separator className="bg-border/60" />

          {/* Contact */}
          <FieldGroup icon={UserPlus} title={t("users.contactDetails")}>
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

            {/* Title — select existing, add new, or delete custom ones */}
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
                  <SelectTrigger className="w-full border-border focus:ring-primary">
                    <SelectValue placeholder={t("common.selectTitlePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
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

          {/* Role & Password */}
          <FieldGroup icon={ShieldCheck} title={t("users.accessAndSecurity")}>
            <Field label={t("common.role")} required error={errors.role?.message}>
              <Select defaultValue="User" onValueChange={handleRoleChange}>
                <SelectTrigger className="w-full border-border focus:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">{t("common.roleAdmin")}</SelectItem>
                  <SelectItem value="User">{t("common.roleUser")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <div className="flex items-start gap-2 rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground sm:col-span-2">
              <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span>
                {t("users.tempPasswordNotice")}
              </span>
            </div>
          </FieldGroup>

          <Separator className="bg-border/60" />

          {/* Notes */}
          <FieldGroup icon={FileText} title={t("common.notes")}>
            <div className="space-y-1.5 sm:col-span-2">
              <Textarea
                {...register("notes")}
                placeholder={t("users.notesPlaceholder")}
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
              ) : t("users.createUser")}
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}