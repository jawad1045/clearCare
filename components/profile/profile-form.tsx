"use client";

import { useState, useTransition } from "react";
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

const nameSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

type NameFormValues = z.infer<typeof nameSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface Props {
  firstName: string;
  lastName: string;
  email: string;
  redirectTo: string;
  canEditName?: boolean;
}

export function ProfileForm({ firstName, lastName, email, redirectTo, canEditName = true }: Props) {
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
      "Save Name",
      "Are you sure you want to update your name?",
      "Save Name",
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
            setNameMsg({ ok: false, text: err instanceof Error ? err.message : "Something went wrong." });
          }
        });
      }
    );
  }

  function onPwSubmit(values: PasswordFormValues) {
    openConfirm(
      "Update Password",
      "Are you sure you want to change your password? You will need to use the new password on your next login.",
      "Update Password",
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
            setPwMsg({ ok: false, text: err instanceof Error ? err.message : "Something went wrong." });
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
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <form onSubmit={handleNameSubmit(onNameSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="firstName">First Name</Label>
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
                <Label htmlFor="lastName">Last Name</Label>
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
              <Label>Email</Label>
              <Input value={email} disabled className="opacity-60" />
            </div>
            {!canEditName && (
              <p className="text-sm text-muted-foreground">
                Your name is managed by your administrator. Contact them to make changes.
              </p>
            )}
            {nameMsg && (
              <p className={`text-sm ${nameMsg.ok ? "text-green-500" : "text-destructive"}`}>
                {nameMsg.text}
              </p>
            )}
            {canEditName && (
              <Button type="submit" disabled={namePending}>
                {namePending ? "Saving…" : "Save Name"}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <form onSubmit={handlePwSubmit(onPwSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="currentPassword">Current Password</Label>
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
              <Label htmlFor="newPassword">New Password</Label>
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
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
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
                {pwPending ? "Updating…" : "Update Password"}
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">
                    Reset Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4 py-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <ShieldAlert className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">Contact your Administrator</p>
                      <p className="text-sm text-muted-foreground">
                        To reset your password, please ask your admin to reset it for you from the Users section.
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
