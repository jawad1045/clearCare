"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { updateReferralStatus } from "@/action/referral.action";
import { updateBHReferralStatus } from "@/action/bh-referral.action";

import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REFERRAL_STATUSES, getStatusLabel } from "@/lib/referral-statuses";

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
  const [status, setStatus] = useState(
    (REFERRAL_STATUSES as readonly string[]).includes(currentStatus) ? currentStatus : "Pending"
  );

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleUpdate = () => {
    startTransition(async () => {
      try {
        if (isBH) {
          const redirectTo = await updateBHReferralStatus(referralId, status);

          toast.success("Status updated successfully");

          if (redirectTo) {
            router.push(redirectTo);
            return;
          }
        } else {
          await updateReferralStatus(referralId, status);

          toast.success("Status updated successfully");
        }
      } catch (error) {
        console.error(error);

        toast.error("Failed to update status");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Select
          value={status}
          onValueChange={setStatus}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>

          <SelectContent>
            {REFERRAL_STATUSES.map(
              (statusOption) => (
                <SelectItem
                  key={statusOption}
                  value={statusOption}
                >
                  {getStatusLabel(statusOption)}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleUpdate}
        disabled={
          isPending ||
          status === currentStatus
        }
      >
        {isPending
          ? "Updating..."
          : "Update Status"}
      </Button>
    </div>
  );
}