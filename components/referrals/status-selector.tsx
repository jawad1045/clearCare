"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { updateReferralStatus } from "@/action/referral.action";
import { updateBHReferralStatus } from "@/action/bh-referral.action";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REFERRAL_STATUSES, getStatusLabel } from "@/lib/referral-statuses";
import { useTranslation } from "@/locale/use-translation";

type Props = {
  referralId: number;
  currentStatus: string;
  isBH?: boolean;
};

export function UpdateStatusForm({
  referralId,
  currentStatus,
  isBH,
}: Props) {
  const { t, locale } = useTranslation();
  const [status, setStatus] = useState(
    (REFERRAL_STATUSES as readonly string[]).includes(currentStatus) ? currentStatus : "Pending"
  );
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSelect = (value: string) => {
    if (value === status) return;
    setPendingStatus(value);
  };

  const handleConfirm = () => {
    if (!pendingStatus) return;
    const newStatus = pendingStatus;
    setPendingStatus(null);

    startTransition(async () => {
      try {
        if (isBH) {
          const redirectTo = await updateBHReferralStatus(referralId, newStatus);

          setStatus(newStatus);
          toast.success(t("referrals.statusUpdatedSuccess"));

          if (redirectTo) {
            router.push(redirectTo);
            return;
          }

          router.refresh();
        } else {
          await updateReferralStatus(referralId, newStatus);

          setStatus(newStatus);
          toast.success(t("referrals.statusUpdatedSuccess"));
          router.refresh();
        }
      } catch (error) {
        console.error(error);

        toast.error(t("referrals.statusUpdateFailed"));
      }
    });
  };

  return (
    <div className="space-y-4">
      <ConfirmDialog
        open={pendingStatus !== null}
        onConfirm={handleConfirm}
        onCancel={() => setPendingStatus(null)}
        title={t("referrals.updateStatusTitle")}
        description={t("referrals.updateStatusDescription", { status: pendingStatus ? getStatusLabel(pendingStatus, locale) : "" })}
        confirmLabel={t("referrals.updateStatusConfirm")}
      />

      <div>
        <Select
          value={status}
          onValueChange={handleSelect}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("referrals.selectStatusPlaceholder")} />
          </SelectTrigger>

          <SelectContent>
            {REFERRAL_STATUSES.map(
              (statusOption) => (
                <SelectItem
                  key={statusOption}
                  value={statusOption}
                >
                  {getStatusLabel(statusOption, locale)}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}