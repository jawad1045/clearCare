"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ShieldAlert, Eye, EyeOff } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { updateProfileName, updateProfilePassword } from "@/action/user.action";
import { useTranslation } from "@/locale/use-translation";

function useNameSchema(t: ReturnType<typeof useTranslation>["t"]) {
  return useMemo(
    () =>
      z.object({
        firstName: z.string().min(1, t("common.validation.firstNameRequired")),
        lastName: z.string().min(1, t("common.validation.lastNameRequired")),
      }),
    [t]
  );
}

type NameFormValues = z.infer<ReturnType<typeof useNameSchema>>;

function usePasswordSchema(t: ReturnType<typeof useTranslation>["t"]) {
  return useMemo(
    () =>
      z
        .object({
          currentPassword: z.string().min(1, t("profile.currentPasswordRequired")),
          newPassword: z.string().min(8, t("profile.newPasswordMinLength")),
          confirmPassword: z.string().min(1, t("profile.confirmPasswordRequired")),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
          message: t("profile.passwordsDoNotMatch"),
          path: ["confirmPassword"],
        }),
    [t]
  );
}

type PasswordFormValues = z.infer<ReturnType<typeof usePasswordSchema>>;

interface Props {
  firstName: string;
  lastName: string;
  email: string;
  redirectTo: string;
  canEditName?: boolean;
}

export function ProfileForm({ firstName, lastName, email, redirectTo, canEditName = true }: Props) {
  const { t } = useTranslation();
  const nameSchema = useNameSchema(t);
  const passwordSchema = usePasswordSchema(t);
  const router = useRouter();
  const [nameMsg, setNameMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [namePending, startNameTransition] = useTransition();
  const [pwPending, startPwTransition] = useTransition();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMeta, setConfirmMeta] = useState<{ title: string; description: string; label: string; action: () => void } | null>(null);

  const {
    register: registerName,
    handleSubmit: handleNameSubmit,
    formState: { errors: nameErrors },
  } = useForm<NameFormValues>({
    resolver: zodResolver(nameSchema),
    defaultValues: { firstName, lastName },
  });

  const {
    register: registerPw,
    handleSubmit: handlePwSubmit,
    reset: resetPwForm,
    formState: { errors: pwErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  function openConfirm(title: string, description: string, label: string, action: () => void) {
    setConfirmMeta({ title, description, label, action });
    setConfirmOpen(true);
  }

  function onNameSubmit(values: NameFormValues) {
    openConfirm(
      t("profile.saveNameTitle"),
      t("profile.saveNameConfirm"),
      t("profile.saveNameTitle"),
      () => {
        setConfirmOpen(false);
        setNameMsg(null);
        startNameTransition(async () => {
          try {
            const formData = new FormData();
            formData.set("firstName", values.firstName);
            formData.set("lastName", values.lastName);
            await updateProfileName(formData);
            router.push(redirectTo);
          } catch (err: unknown) {
            setNameMsg({ ok: false, text: err instanceof Error ? err.message : t("profile.genericErrorPeriod") });
          }
        });
      }
    );
  }

  function onPwSubmit(values: PasswordFormValues) {
    openConfirm(
      t("profile.updatePasswordTitle"),
      t("profile.updatePasswordConfirm"),
      t("profile.updatePasswordTitle"),
      () => {
        setConfirmOpen(false);
        setPwMsg(null);
        startPwTransition(async () => {
          try {
            const formData = new FormData();
            formData.set("currentPassword", values.currentPassword);
            formData.set("newPassword", values.newPassword);
            formData.set("confirmPassword", values.confirmPassword);
            await updateProfilePassword(formData);
            resetPwForm();
            router.push(redirectTo);
          } catch (err: unknown) {
            setPwMsg({ ok: false, text: err instanceof Error ? err.message : t("profile.genericErrorPeriod") });
          }
        });
      }
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <ConfirmDialog
        open={confirmOpen}
        onConfirm={() => confirmMeta?.action()}
        onCancel={() => setConfirmOpen(false)}
        title={confirmMeta?.title}
        description={confirmMeta?.description}
        confirmLabel={confirmMeta?.label}
      />
      {/* Name */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.personalInformation")}</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <form onSubmit={handleNameSubmit(onNameSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="firstName">{t("common.firstName")}</Label>
                <Input
                  id="firstName"
                  {...registerName("firstName")}
                  readOnly={!canEditName}
                  disabled={!canEditName}
                  className={!canEditName ? "opacity-60" : undefined}
                />
                {canEditName && nameErrors.firstName && (
                  <p className="text-xs text-destructive">{nameErrors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName">{t("common.lastName")}</Label>
                <Input
                  id="lastName"
                  {...registerName("lastName")}
                  readOnly={!canEditName}
                  disabled={!canEditName}
                  className={!canEditName ? "opacity-60" : undefined}
                />
                {canEditName && nameErrors.lastName && (
                  <p className="text-xs text-destructive">{nameErrors.lastName.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <Label>{t("common.email")}</Label>
              <Input value={email} disabled className="opacity-60" />
            </div>
            {!canEditName && (
              <p className="text-sm text-muted-foreground">
                {t("profile.nameManagedByAdmin")}
              </p>
            )}
            {nameMsg && (
              <p className={`text-sm ${nameMsg.ok ? "text-green-500" : "text-destructive"}`}>
                {nameMsg.text}
              </p>
            )}
            {canEditName && (
              <Button type="submit" disabled={namePending}>
                {namePending ? t("common.saving") : t("profile.saveNameTitle")}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.changePasswordTitle")}</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <form onSubmit={handlePwSubmit(onPwSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="currentPassword">{t("profile.currentPasswordLabel")}</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  {...registerPw("currentPassword")}
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground">
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {pwErrors.currentPassword && (
                <p className="text-xs text-destructive">{pwErrors.currentPassword.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="newPassword">{t("profile.newPasswordLabel")}</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  {...registerPw("newPassword")}
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {pwErrors.newPassword && (
                <p className="text-xs text-destructive">{pwErrors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">{t("profile.confirmNewPasswordLabel")}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  {...registerPw("confirmPassword")}
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {pwErrors.confirmPassword && (
                <p className="text-xs text-destructive">{pwErrors.confirmPassword.message}</p>
              )}
            </div>
            {pwMsg && (
              <p className={`text-sm ${pwMsg.ok ? "text-green-500" : "text-destructive"}`}>
                {pwMsg.text}
              </p>
            )}
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={pwPending}>
                {pwPending ? t("profile.updating") : t("profile.updatePasswordTitle")}
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">
                    {t("profile.resetPasswordDialogTrigger")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>{t("profile.resetPasswordDialogTitle")}</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4 py-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <ShieldAlert className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">{t("profile.contactAdminTitle")}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("profile.contactAdminDescription")}
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
