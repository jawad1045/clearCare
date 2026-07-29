"use client";

import { ArrowUpDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { ReportRow } from "@/action/report.action";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { getStatusBadge, getStatusLabel } from "@/lib/referral-statuses";
import { SERVICE_TYPE_LABEL_KEYS } from "@/lib/referral-filters";

import { useTranslation } from "@/locale/use-translation";

export function reportColumns(
  t: ReturnType<typeof useTranslation>["t"],
  locale: "en" | "es",
  isAdmin: boolean
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
      cell: ({ row }) => (
        <Badge
          className={getStatusBadge(row.original.status)}
          variant="outline"
        >
          {getStatusLabel(row.original.status, locale)}
        </Badge>
      ),
    },

    {
      accessorKey: "dateOfReferral",
      ...sortableHeader(t("common.date")),

      sortingFn: (rowA, rowB) => {
        return (
          new Date(
            rowA.original.dateOfReferral
          ).getTime() -
          new Date(
            rowB.original.dateOfReferral
          ).getTime()
        );
      },

      cell: ({ row }) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {new Date(
            row.original.dateOfReferral
          ).toLocaleDateString()}
        </span>
      ),
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
        <span className="text-xs text-muted-foreground">
          —
        </span>
      ),
  });

  return columns;
}