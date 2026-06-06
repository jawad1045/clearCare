"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateReferralStatus } from "@/action/referral.action";

import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  referralId: number;
  currentStatus: string;
};

const STATUSES = [
  "Pending",
  "Reviewing",
  "Approved",
  "Rejected",
  "Completed",
];

export function UpdateStatusForm({
  referralId,
  currentStatus,
}: Props) {
  const [status, setStatus] =
    useState(currentStatus);

  const [isPending, startTransition] =
    useTransition();

  const handleUpdate = () => {
    startTransition(async () => {
      try {
        await updateReferralStatus(
          referralId,
          status
        );

        toast.success(
          "Status updated successfully"
        );
      } catch (error) {
        console.error(error);

        toast.error(
          "Failed to update status"
        );
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
            {STATUSES.map(
              (statusOption) => (
                <SelectItem
                  key={statusOption}
                  value={statusOption}
                >
                  {statusOption}
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