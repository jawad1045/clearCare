"use client";

import { useState } from "react";
import { ArrowUpDown, Loader2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { ReportRow } from "@/action/report.action";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import { getStatusBadge, getStatusLabel } from "@/lib/referral-statuses";
import { SERVICE_TYPE_LABEL_KEYS } from "@/lib/referral-filters";

import { useTranslation } from "@/locale/use-translation";
import { formatDateTime } from "@/lib/format-date";
import type { StatusHistoryEntry } from "@/types/status-history";

// New: small inline component so status cell can hold hook state (useState)
// without turning the whole cell renderer into a component itself.
function StatusHistoryHoverCell({
  status,
  label,
  referralId,
  locale,
  t,
  fetchStatusHistory,
}: {
  status: string;
  label: string;
  referralId: number;
  locale: "en" | "es";
  t: ReturnType<typeof useTranslation>["t"];
  fetchStatusHistory: (referralId: number) => Promise<StatusHistoryEntry[]>;
}) {
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
      <HoverCardTrigger asChild>
        <Badge className={getStatusBadge(status)} variant="outline">
          {label}
        </Badge>
      </HoverCardTrigger>

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

export function reportColumns(
  t: ReturnType<typeof useTranslation>["t"],
  locale: "en" | "es",
  isAdmin: boolean,
  fetchStatusHistory: (referralId: number) => Promise<StatusHistoryEntry[]> // 👈 new param
): ColumnDef<ReportRow>[] {
  const sortableHeader = (label: string) => ({
    header: ({ column }: any) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        {label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  });

  const columns: ColumnDef<ReportRow>[] = [
    {
      accessorKey: "id",
      ...sortableHeader(t("common.id")),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          #{row.original.id}
        </span>
      ),
    },

    {
      accessorKey: "patientName",
      ...sortableHeader(t("common.patient")),
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.patientName}
        </span>
      ),
    },

    {
      accessorKey: "companyName",
      ...sortableHeader(t("common.company")),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.companyName}
        </span>
      ),
    },

    {
      accessorKey: "serviceType",
      ...sortableHeader(t("common.service")),
      cell: ({ row }) => {
        const key =
          SERVICE_TYPE_LABEL_KEYS[
            row.original.serviceType as keyof typeof SERVICE_TYPE_LABEL_KEYS
          ];

        return key ? t(key) : row.original.serviceType;
      },
    },

    {
      accessorKey: "status",
      ...sortableHeader(t("common.status")),
      // Changed: was a plain Badge, now wrapped with hover-triggered status history
      cell: ({ row }) => (
        <StatusHistoryHoverCell
          status={row.original.status}
          label={getStatusLabel(row.original.status, locale)}
          referralId={row.original.id}
          locale={locale}
          t={t}
          fetchStatusHistory={fetchStatusHistory}
        />
      ),
    },

    {
      accessorKey: "dateOfReferral",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("common.created")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatDateTime(row.original.dateOfReferral),
    },
  ];

  if (isAdmin) {
    columns.push({
      accessorKey: "referName",
      ...sortableHeader(t("referrals.referredByLabel")),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.referName}
        </span>
      ),
    });
  }

  columns.push({
    id: "result",
    header: t("common.result"),
    cell: ({ row }) =>
      row.original.hasPdfResult ? (
        <span className="text-xs font-medium text-emerald-600">
          {t("reports.available")}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  });

  return columns;
}