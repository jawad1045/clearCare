"use client";

import { useState } from "react";
import { resetUserPassword } from "@/action/user.action";
import { Button } from "@/components/ui/button";
import { KeyRound, Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

interface Props {
  userId: number;
  userName: string;
}

export function ResetPasswordDialog({ userId, userName }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function doReset() {
    setConfirmOpen(false);
    setPending(true);
    try {
      await resetUserPassword(userId);
      toast.success(`A temporary password has been emailed to ${userName}.`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <ConfirmDialog
        open={confirmOpen}
        onConfirm={doReset}
        onCancel={() => setConfirmOpen(false)}
        title="Reset Password"
        description={`This will generate a new temporary password and email it to ${userName}. They will need to use it to log in and should change it right away.`}
        confirmLabel="Send Temporary Password"
      />
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5"
        disabled={pending}
        onClick={() => setConfirmOpen(true)}
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
        Reset Password
      </Button>
    </>
  );
}
