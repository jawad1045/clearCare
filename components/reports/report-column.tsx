"use client";

import { useState } from "react";
import { ArrowUpDown, Eye, Loader2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { ReportRow } from "@/action/report.action";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getStatusBadge, getStatusLabel } from "@/lib/referral-statuses";
import { SERVICE_TYPE_LABEL_KEYS } from "@/lib/referral-filters";

import { useTranslation } from "@/locale/use-translation";
import { useLocalFormatDate } from "@/hooks/use-local-format-date";
import type { StatusHistoryEntry } from "@/types/status-history";

// Assumes the standard shadcn mobile-detection hook exists at this path
// (generated e.g. by `npx shadcn add sidebar`). Adjust the import if yours
// lives elsewhere, or swap in your own `useMediaQuery("(max-width: 767px)")`.
import { useIsMobile } from "@/hooks/use-mobile";



// New: status cell now shows a "View" button. Clicking it fetches (and
// caches) status history, then displays it in a Dialog on desktop or a
// Sheet on mobile, rendered as a color-coded table.
function StatusHistoryCell({
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
  const isMobile = useIsMobile();
  const { formatDate } = useLocalFormatDate();

  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<StatusHistoryEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen || history !== null || loading) return;
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

  const historyContent = (
    <>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead className="text-right">{t("common.date")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <Badge
                    className={getStatusBadge(entry.status)}
                    variant="outline"
                  >
                    {getStatusLabel(entry.status, locale)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatDate(entry.changedAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );

  return (
    <div className="flex items-center gap-2">
      <Badge className={getStatusBadge(status)} variant="outline">
        {label}
      </Badge>

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => handleOpenChange(true)}
      >
        <Eye className="h-3.5 w-3.5" />
      </Button>

      {isMobile ? (
        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>{t("common.statusHistory")}</SheetTitle>
            </SheetHeader>
            <div className="mt-4">{historyContent}</div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("common.statusHistory")}</DialogTitle>
            </DialogHeader>
            {historyContent}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export function reportColumns(
  t: ReturnType<typeof useTranslation>["t"],
  locale: "en" | "es",
  isAdmin: boolean,
  fetchStatusHistory: (referralId: number) => Promise<StatusHistoryEntry[]>
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
      // Changed: badge + "View" button that opens a Dialog (desktop) or
      // Sheet (mobile) showing the status history as a color-coded table.
      cell: ({ row }) => (
        <StatusHistoryCell
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
      cell: ({ row }) => {
        const { formatDateTime } = useLocalFormatDate();
        return <span className="whitespace-nowrap">{formatDateTime(row.original.dateOfReferral)}</span>;
      },
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