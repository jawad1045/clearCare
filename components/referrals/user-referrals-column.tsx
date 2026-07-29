"use client";

import Link from "next/link";
import { ArrowUpDown, Download } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { formatDateTime } from "@/lib/format-date";
import {
  getStatusColor,
  getStatusLabel,
} from "@/lib/referral-statuses";
import {
  SERVICE_TYPE_LABEL_KEYS,
  getPriorityLabel,
} from "@/lib/referral-filters";

import { useTranslation } from "@/locale/use-translation";
import { getMyReferrals } from "@/action/referral.action";

export type Referral =
  Awaited<
    ReturnType<typeof getMyReferrals>
  >["referrals"][number];

export function columns(
  basePath: string,
  t: ReturnType<typeof useTranslation>["t"],
  locale: "en" | "es"
): ColumnDef<Referral>[] {
  return [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button
          variant="ghost"
           
          onClick={() =>
            column.toggleSorting(
              column.getIsSorted() === "asc"
            )
          }
        >
          {t("common.id")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <>#{row.original.id}</>,
    },

    {
      id: "patient",
      accessorFn: (row) =>
        `${row.patientFirstName ?? ""} ${row.patientLastName ?? ""}`,
      header: ({ column }) => (
        <Button
          variant="ghost"
           
          onClick={() =>
            column.toggleSorting(
              column.getIsSorted() === "asc"
            )
          }
        >
          {t("common.patient")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.patientFirstName}{" "}
          {row.original.patientLastName}
        </span>
      ),
    },

    {
      id: "parent",
      accessorFn: (row) =>
        `${row.parentFirstName ?? ""} ${row.parentLastName ?? ""}`,
      header: ({ column }) => (
        <Button
          variant="ghost"
           
          onClick={() =>
            column.toggleSorting(
              column.getIsSorted() === "asc"
            )
          }
        >
          {t("common.parent")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <>
          {row.original.parentFirstName}{" "}
          {row.original.parentLastName}
        </>
      ),
    },

    {
      accessorKey: "serviceType",
      header: ({ column }) => (
        <Button
          variant="ghost"
           
          onClick={() =>
            column.toggleSorting(
              column.getIsSorted() === "asc"
            )
          }
        >
          {t("common.serviceType")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const service =
          row.original.serviceType as keyof typeof SERVICE_TYPE_LABEL_KEYS;

        return SERVICE_TYPE_LABEL_KEYS[service]
          ? t(SERVICE_TYPE_LABEL_KEYS[service])
          : row.original.serviceType;
      },
    },

    {
      accessorKey: "priority",
      header: ({ column }) => (
        <Button
          variant="ghost"
           
          onClick={() =>
            column.toggleSorting(
              column.getIsSorted() === "asc"
            )
          }
        >
          {t("common.priority")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) =>
        getPriorityLabel(
          row.original.priority ?? "",
          t
        ),
    },

    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
           
          onClick={() =>
            column.toggleSorting(
              column.getIsSorted() === "asc"
            )
          }
        >
          {t("common.status")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const color = getStatusColor(
          row.original.status
        );

        return (
          <Badge
            variant="outline"
            style={{
              backgroundColor: color + "22",
              color,
              borderColor: color + "55",
            }}
          >
            {getStatusLabel(
              row.original.status,
              locale
            )}
          </Badge>
        );
      },
    },

    {
      accessorKey: "dateOfReferral",
      header: ({ column }) => (
        <Button
          variant="ghost"
           
          onClick={() =>
            column.toggleSorting(
              column.getIsSorted() === "asc"
            )
          }
        >
          {t("common.created")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDateTime(
            row.original.dateOfReferral
          )}
        </span>
      ),
    },

    {
      accessorKey: "lastUpdated",
      header: ({ column }) => (
        <Button
          variant="ghost"
           
          onClick={() =>
            column.toggleSorting(
              column.getIsSorted() === "asc"
            )
          }
        >
          {t("common.lastUpdated")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDateTime(
            row.original.lastUpdated
          )}
        </span>
      ),
    },

  {
  id: "actions",
  enableSorting: false,
  size: 180,
  header: () => (
    <div className="w-48 text-right">
      {t("common.actions")}
    </div>
  ),
  cell: ({ row }) => (
    <div className="flex w-48 items-center justify-end gap-2">
      <Link href={`${basePath}/${row.original.id}`}>
        <Button variant="outline" size="sm">
          {t("common.view")}
        </Button>
      </Link>

      {row.original.pdfResult ? (
        <Link
          href={row.original.pdfResult}
          target="_blank"
          rel="noopener noreferrer"
          download
        >
          <Button
            variant="outline"
            size="sm"
            className="w-24 gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            {t("common.result")}
          </Button>
        </Link>
      ) : (
        <Button
          variant="outline"
          size="sm"
          disabled
          className="w-24 gap-1.5 opacity-50"
        >
          <Download className="h-3.5 w-3.5" />
          {t("common.result")}
        </Button>
      )}
    </div>
  ),
}
  ];
}