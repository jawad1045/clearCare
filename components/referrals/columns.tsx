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


type TranslationFunction = ReturnType<
  typeof import("@/locale/use-translation").useTranslation
>["t"];


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
  locale: "en" | "es"
): ColumnDef<BHReferral>[] => [

  {
    accessorKey: "id",

    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-sidebar/80 hover:text-sidebar-foreground"
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
        className="px-0 hover:bg-sidebar/80 hover:text-sidebar-foreground"
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
        className="px-0 hover:bg-sidebar/80 hover:text-sidebar-foreground"
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
        className="px-0 hover:bg-sidebar/80 hover:text-sidebar-foreground"
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
        className="px-0 hover:bg-sidebar/80 hover:text-sidebar-foreground"
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

      const status = row.original.status;

      const color =
        getStatusColor(status);


      return (
        <Badge
          variant="outline"
          style={{
            backgroundColor:
              color + "22",
            color,
            borderColor:
              color + "55",
          }}
        >
          {getStatusLabel(
            status,
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
        className="px-0 hover:bg-sidebar/80 hover:text-sidebar-foreground"
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
        className="px-0 hover:bg-sidebar/80 hover:text-sidebar-foreground"
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