"use client";

import Link from "next/link";
import { ArrowUpDown, Download, Upload } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { formatDateTime } from "@/lib/format-date";
import {
  getStatusColor,
  getStatusLabel,
} from "@/lib/referral-statuses";
import { StatusHistoryHoverCell } from "@/components/status-history-hover-cell";
import type { StatusHistoryEntry } from "@/types/status-history";


type TranslationFunction = (
  key: any,
  vars?: Record<string, string | number>
) => string;
export type BHReferral = {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  gender: string;
  status: string;
  dateOfReferral: Date;
  lastUpdated: Date;
  pdfReport: string | null;

  user: {
    contactFirstName: string;
    contactLastName: string;
  };

  company: {
    organization: string;
  };
};


export const columns = (
  basePath: string,
  t: TranslationFunction,
  locale: "en" | "es",
  fetchStatusHistory: (referralId: number) => Promise<StatusHistoryEntry[]>
): ColumnDef<BHReferral>[] => [

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

    cell: ({ row }) => (
      <>#{row.original.id}</>
    ),
  },


  {
    id: "client",

    accessorFn: (row) =>
      `${row.firstName} ${row.lastName}`,

    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(
            column.getIsSorted() === "asc"
          )
        }
      >
        {t("common.client")}
        <ArrowUpDown className="ml-2 h-4" />
      </Button>
    ),

    cell: ({ row }) => (
      <>
        {row.original.firstName}{" "}
        {row.original.lastName}
      </>
    ),
  },


  {
    id: "submittedBy",

    accessorFn: (row) =>
      `${row.user.contactFirstName} ${row.user.contactLastName}`,

    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(
            column.getIsSorted() === "asc"
          )
        }
      >
        {t("common.submittedBy")}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),

    cell: ({ row }) => (
      <>
        {row.original.user.contactFirstName}{" "}
        {row.original.user.contactLastName}
      </>
    ),
  },


  {
    id: "company",

    accessorFn: (row) =>
      row.company.organization,

    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(
            column.getIsSorted() === "asc"
          )
        }
      >
        {t("common.company")}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),

    cell: ({ row }) => (
      <>
        {row.original.company.organization}
      </>
    ),
  },


  {
    accessorKey: "phone",

    header: () => t("common.phone"),
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

    // Changed: badge is now the HoverCard trigger; content is fetched lazily on hover
    cell: ({ row }) => {

      const status = row.original.status;
      const color = getStatusColor(status);

      return (
        <StatusHistoryHoverCell
          referralId={row.original.id}
          locale={locale}
          t={t}
          fetchStatusHistory={fetchStatusHistory}
        >
          <Badge
            variant="outline"
            className="cursor-default"
            style={{
              backgroundColor: color + "22",
              color,
              borderColor: color + "55",
            }}
          >
            {getStatusLabel(status, locale)}
          </Badge>
        </StatusHistoryHoverCell>
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

    header: () => t("common.actions"),

    cell: ({ row }) => {

      const referral = row.original;


      return (
        <div className="flex items-center gap-2">

          <Button
            asChild
            size="sm"
            variant="outline"
          >
            <Link
              href={`${basePath}/${referral.id}`}
            >
              {t("common.view")}
            </Link>
          </Button>


          {
            referral.pdfReport
            ?

            <Button
              asChild
              size="sm"
              variant="outline"
              className="gap-1.5"
            >
              <Link
                href={referral.pdfReport}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                <Download className="h-3.5 w-3.5" />

                {t("common.result")}
              </Link>
            </Button>

            :

            <Button
              asChild
              size="sm"
              variant="outline"
              className="gap-1.5 text-muted-foreground"
            >
              <Link
                href={`${basePath}/${referral.id}`}
              >
                <Upload className="h-3.5 w-3.5" />

                {t("common.uploadResult")}
              </Link>
            </Button>
          }


        </div>
      );
    },
  },

];