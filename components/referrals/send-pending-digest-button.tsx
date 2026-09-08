"use client";

import { useState, useTransition } from "react";
import { Mail, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  checkAndSendPendingReferralsDigest,
  getPendingReferralsCounts,
  getDefaultPendingDigestRecipients,
} from "@/action/pending-digest.action";

type Props = {
  buttonVariant?: "default" | "outline" | "secondary";
  buttonSize?: "default" | "sm" | "lg";
  className?: string;
  defaultEmail?: string;
};

export function SendPendingDigestButton({
  buttonVariant = "outline",
  buttonSize = "default",
  className,
  defaultEmail = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(defaultEmail);
  const [isPending, startTransition] = useTransition();
  const [counts, setCounts] = useState<{ medicalCount: number; bhCount: number; totalPending: number } | null>(null);
  const [loadingCounts, setLoadingCounts] = useState(false);

  async function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen);
    if (newOpen) {
      setLoadingCounts(true);
      try {
        const [c, defaultRecipients] = await Promise.all([
          getPendingReferralsCounts(),
          !email ? getDefaultPendingDigestRecipients() : Promise.resolve(""),
        ]);
        setCounts(c);
        if (defaultRecipients && !email) {
          setEmail(defaultRecipients);
        }
      } catch {
        // ignore error fetching counts preview
      } finally {
        setLoadingCounts(false);
      }
    }
  }

  function handleSend() {
    startTransition(async () => {
      try {
        const result = await checkAndSendPendingReferralsDigest(email.trim() || undefined);
        toast.success(
          `Pending summary email sent to ${result.sentTo} (${result.totalPending} pending: ${result.medicalCount} Medical, ${result.bhCount} BH)`
        );
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to send pending referrals digest email");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className={className}>
          <Mail className="mr-2 h-4 w-4" />
          Send Pending Summary
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            24h Pending Referrals Summary
          </DialogTitle>
          <DialogDescription>
            Tally remaining pending Medical and Behavioral Health referrals and send an automated summary email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Quick Counts Preview */}
          <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-3 text-center">
            <div>
              <div className="text-xl font-bold text-amber-600">
                {loadingCounts ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : (counts?.totalPending ?? "—")}
              </div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase mt-0.5">Total Pending</div>
            </div>
            <div>
              <div className="text-xl font-bold text-blue-600">
                {loadingCounts ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : (counts?.medicalCount ?? "—")}
              </div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase mt-0.5">Medical</div>
            </div>
            <div>
              <div className="text-xl font-bold text-purple-600">
                {loadingCounts ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : (counts?.bhCount ?? "—")}
              </div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase mt-0.5">BH</div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="digest-email" className="text-xs font-semibold">
              Recipient Email Address(es)
            </Label>
            <Input
              id="digest-email"
              type="text"
              placeholder="e.g. email1@example.com, email2@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              Separate multiple emails with commas. If left blank, the digest will be sent to the configured notification recipient(s) or system administrator.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Email Now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

