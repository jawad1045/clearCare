"use client";

import Link from "next/link";
import { ArrowUpDown, Download } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { getMyBHReferrals } from "@/action/bh-referral.action";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { formatDateTime } from "@/lib/format-date";
import {
  getStatusColor,
  getStatusLabel,
} from "@/lib/referral-statuses";

import { useTranslation } from "@/locale/use-translation";

export type BHReferral =
  Awaited<
    ReturnType<typeof getMyBHReferrals>
  >["referrals"][number];

export function columns(
  basePath: string,
  t: ReturnType<typeof useTranslation>["t"],
  locale: "en" | "es"
): ColumnDef<BHReferral>[] {
  return [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          {t("common.id")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <>#{row.original.id}</>,
    },

    {
      accessorKey: "patientId",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          Patient ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <>{row.original.patientId || "-"}</>,
    },

    {
      id: "client",
      accessorFn: (row) =>
        `${row.firstName ?? ""} ${row.lastName ?? ""}`,
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          {t("common.client")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.firstName} {row.original.lastName}
        </span>
      ),
    },

    {
      accessorKey: "phone",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          {t("common.phone")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => row.original.phone,
    },

    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          {t("common.status")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const color = getStatusColor(row.original.status);

        return (
          <Badge
            variant="outline"
            style={{
              backgroundColor: color + "22",
              color,
              borderColor: color + "55",
            }}
          >
            {getStatusLabel(row.original.status, locale)}
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
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          {t("common.created")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDateTime(row.original.dateOfReferral)}
        </span>
      ),
    },

    {
      accessorKey: "lastUpdated",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          {t("common.lastUpdated")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDateTime(row.original.lastUpdated)}
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
        <div className="flex items-center justify-end">
          <Link href={`${basePath}/${row.original.id}`}>
            <Button variant="outline" size="sm">
              {t("common.view")}
            </Button>
          </Link>

          {row.original.pdfReport ? (
            <Link
              href={row.original.pdfReport}
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
    },
  ];
}