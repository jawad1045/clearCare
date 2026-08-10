"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { formatDateTime } from "@/lib/format-date";
import { getStatusLabel } from "@/lib/referral-statuses";
import type { StatusHistoryEntry } from "@/types/status-history";

type TranslationFunction = (
  key: any,
  vars?: Record<string, string | number>
) => string;

type Props = {
  referralId: number;
  locale: "en" | "es";
  t: TranslationFunction;
  fetchStatusHistory: (referralId: number) => Promise<StatusHistoryEntry[]>;
  children: React.ReactNode; // the trigger, e.g. your existing Badge
};

export function StatusHistoryHoverCell({
  referralId,
  locale,
  t,
  fetchStatusHistory,
  children,
}: Props) {
  const [history, setHistory] = useState<StatusHistoryEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleOpenChange(open: boolean) {
    if (!open || history !== null || loading) return;
    setLoading(true);
    setError(false);
    try {
      const data = await fetchStatusHistory(referralId);
      setHistory(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <HoverCard openDelay={150} closeDelay={100} onOpenChange={handleOpenChange}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>

      <HoverCardContent className="w-64" align="start">
        <p className="mb-2 text-sm font-medium">{t("common.statusHistory")}</p>

        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            {t("common.loading")}
          </div>
        )}

        {error && (
          <p className="text-xs text-destructive">
            {t("common.errorLoadingHistory")}
          </p>
        )}

        {!loading && !error && history?.length === 0 && (
          <p className="text-xs text-muted-foreground">
            {t("common.noHistoryFound")}
          </p>
        )}

        {!loading && !error && history && history.length > 0 && (
          <ol className="space-y-1.5">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between text-xs"
              >
                <span className="font-medium text-foreground">
                  {getStatusLabel(entry.status, locale)}
                </span>
                <span className="text-muted-foreground">
                  {formatDateTime(entry.changedAt)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}