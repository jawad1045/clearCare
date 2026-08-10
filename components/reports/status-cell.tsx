// components/status-cell.tsx
"use client";

import { useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { StatusHistoryEntry } from "@/types/status-history";
import { formatDateTime } from "@/lib/format-date";

type Props = {
  status: string;
  referralId: number;
  fetchHistory: (referralId: number) => Promise<StatusHistoryEntry[]>;
};

export function StatusCell({ status, referralId, fetchHistory }: Props) {
  const [history, setHistory] = useState<StatusHistoryEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleOpenChange(open: boolean) {
    if (!open || history !== null || loading) return;

    setLoading(true);
    setError(false);
    try {
      const data = await fetchHistory(referralId);
      setHistory(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <HoverCard openDelay={150} closeDelay={100} onOpenChange={handleOpenChange}>
      <HoverCardTrigger asChild>
        <Badge variant="outline" className="cursor-default">
          {status}
        </Badge>
      </HoverCardTrigger>

      <HoverCardContent className="w-64" align="start">
        <p className="mb-2 text-sm font-medium">Status history</p>

        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Loading...
          </div>
        )}

        {error && (
          <p className="text-xs text-destructive">
            Failed to load status history.
          </p>
        )}

        {!loading && !error && history?.length === 0 && (
          <p className="text-xs text-muted-foreground">No history found.</p>
        )}

        {!loading && !error && history && history.length > 0 && (
          <ol className="space-y-1.5">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between text-xs"
              >
                <span className="font-medium text-foreground">
                  {entry.status}
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