"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound, UserPlus, Building2, MapPin, ShieldCheck, FileText } from "lucide-react";
import { toast } from "sonner";

import { createUser } from "@/action/user.action";
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

const userSchema = z
  .object({
    acctId: z.string().optional(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    phone: z
      .string()
      .min(1, "Phone is required")
      .regex(/^\(\d{3}\) \d{3}-\d{4}$/, "Enter a complete phone number"),
    title: z.string().optional(),
    role: z.string().min(1, "Role is required"),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role !== "Admin" && !data.acctId) {
      ctx.addIssue({
        code: "custom",
        path: ["acctId"],
        message: "Organization is required for this role.",
      });
    }
  });

type UserFormValues = z.infer<typeof userSchema>;

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

export function CreateUserForm({ companies }: CreateUserFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<UserFormValues | null>(null);

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

  function handleRoleChange(value: string) {
    setValue("role", value, { shouldValidate: true });
    setValue("acctId", "");
    setSelectedCompany(null);
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
        toast.error(error instanceof Error ? error.message : "Failed to create user");
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
          onCancel={() => { setConfirmOpen(false); setPendingValues(null); }}
          title="Create User"
          description="Are you sure you want to create this user? Please review all details before proceeding."
          confirmLabel="Create User"
        />
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">

          {/* Organization */}
          <FieldGroup icon={Building2} title="Organization">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium text-foreground/80">
                Organization
                {role !== "Admin"
                  ? <span className="ml-0.5 text-primary">*</span>
                  : <span className="ml-1 text-xs text-muted-foreground">(optional for Admin)</span>
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
              {errors.acctId && (
                <p className="text-xs text-destructive">{errors.acctId.message}</p>
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
            <Field label="First Name" required error={errors.firstName?.message}>
              <Input {...register("firstName")}
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Last Name" required error={errors.lastName?.message}>
              <Input {...register("lastName")}
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Email" required error={errors.email?.message}>
              <Input type="email" {...register("email")}
                className="border-border bg-background focus-visible:ring-primary" />
            </Field>
            <Field label="Phone" required error={errors.phone?.message}>
              <Input
                {...register("phone", {
                  onChange: (e) => { e.target.value = formatPhoneInput(e.target.value); },
                })}
                maxLength={14}
                className="border-border bg-background focus-visible:ring-primary"
              />
            </Field>
            <Field label="Title" full>
              <Select onValueChange={(v) => setValue("title", v)}>
                <SelectTrigger className="border-border focus:ring-primary">
                  <SelectValue placeholder="Select title..." />
                </SelectTrigger>
                <SelectContent>
                  {TITLES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          <Separator className="bg-border/60" />

          {/* Role & Password */}
          <FieldGroup icon={ShieldCheck} title="Access & Security">
            <Field label="Role" required error={errors.role?.message}>
              <Select defaultValue="User" onValueChange={handleRoleChange}>
                <SelectTrigger className="border-border focus:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <div className="flex items-start gap-2 rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground sm:col-span-2">
              <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span>
                A temporary password will be generated automatically and emailed to the user
                along with a link to log in and set their own password.
              </span>
            </div>
          </FieldGroup>

          <Separator className="bg-border/60" />

          {/* Notes */}
          <FieldGroup icon={FileText} title="Notes">
            <div className="space-y-1.5 sm:col-span-2">
              <Textarea
                {...register("notes")}
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
