"use client";

import { useState } from "react";
import { resetUserPassword } from "@/action/user.action";
import { Button } from "@/components/ui/button";
import { KeyRound, Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { useTranslation } from "@/locale/use-translation";

interface Props {
  userId: number;
  userName: string;
}

export function ResetPasswordDialog({ userId, userName }: Props) {
  const { t } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function doReset() {
    setConfirmOpen(false);
    setPending(true);
    try {
      await resetUserPassword(userId);
      toast.success(t("users.resetPasswordSuccess", { name: userName }));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("users.resetPasswordGenericError"));
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
        title={t("users.resetPasswordTitle")}
        description={t("users.resetPasswordDescription", { name: userName })}
        confirmLabel={t("users.resetPasswordConfirm")}
      />
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5"
        disabled={pending}
        onClick={() => setConfirmOpen(true)}
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
        {t("users.resetPasswordButton")}
      </Button>
    </>
  );
}
