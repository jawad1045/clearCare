"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileName, updateProfilePassword } from "@/action/user.action";

interface Props {
  firstName: string;
  lastName: string;
  email: string;
  redirectTo: string;
}

export function ProfileForm({ firstName, lastName, email, redirectTo }: Props) {
  const router = useRouter();
  const [nameMsg, setNameMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [namePending, startNameTransition] = useTransition();
  const [pwPending, startPwTransition] = useTransition();
  const pwFormRef = useRef<HTMLFormElement>(null);

  function handleNameSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setNameMsg(null);
    startNameTransition(async () => {
      try {
        await updateProfileName(formData);
        router.push(redirectTo);
      } catch (err: unknown) {
        setNameMsg({ ok: false, text: err instanceof Error ? err.message : "Something went wrong." });
      }
    });
  }

  function handlePwSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setPwMsg(null);
    startPwTransition(async () => {
      try {
        await updateProfilePassword(formData);
        router.push(redirectTo);
      } catch (err: unknown) {
        setPwMsg({ ok: false, text: err instanceof Error ? err.message : "Something went wrong." });
      }
    });
  }

  return (
    <div className="space-y-6 max-w-xl">
      {/* Name */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" defaultValue={firstName} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" defaultValue={lastName} required />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input value={email} disabled className="opacity-60" />
            </div>
            {nameMsg && (
              <p className={`text-sm ${nameMsg.ok ? "text-green-500" : "text-destructive"}`}>
                {nameMsg.text}
              </p>
            )}
            <Button type="submit" disabled={namePending}>
              {namePending ? "Saving…" : "Save Name"}
            </Button>
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
          <form ref={pwFormRef} onSubmit={handlePwSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" name="currentPassword" type="password" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" name="newPassword" type="password" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required />
            </div>
            {pwMsg && (
              <p className={`text-sm ${pwMsg.ok ? "text-green-500" : "text-destructive"}`}>
                {pwMsg.text}
              </p>
            )}
            <Button type="submit" disabled={pwPending}>
              {pwPending ? "Updating…" : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
