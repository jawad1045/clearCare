"use client";

import Link from "next/link";
import { ArrowUpDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResetPasswordDialog } from "@/components/users/reset-password-dialog";
import { useTranslation } from "@/locale/use-translation";

export type User = {
  id: number;
  organization: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  userRole: string;
  isActive: boolean;
  createdDate: Date;
};

const ROLE_LABEL_KEYS: Record<
  string,
  "common.roleAdmin" | "common.roleUser"
> = {
  Admin: "common.roleAdmin",
  User: "common.roleUser",
};

export const columns: ColumnDef<User>[] = [
  {
    accessorFn: (row) =>
      `${row.contactFirstName} ${row.contactLastName}`,
    id: "name",
    header: ({ column }) => {
      const { t } = useTranslation();

      return (
        <Button
          variant="ghost"
          className="px-0 hover:bg-sidebar/80 hover:text-sidebar-foreground"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          {t("common.name")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <>
        {row.original.contactFirstName}{" "}
        {row.original.contactLastName}
      </>
    ),
  },
  {
    accessorKey: "contactEmail",
    header: ({ column }) => {
      const { t } = useTranslation();

      return (
        <Button
          variant="ghost"
          className="px-0 hover:bg-sidebar/80 hover:text-sidebar-foreground"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          {t("common.email")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "organization",
    header: ({ column }) => {
      const { t } = useTranslation();

      return (
        <Button
          variant="ghost"
          className="px-0 hover:bg-sidebar/80 hover:text-sidebar-foreground"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          {t("common.organization")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "userRole",
    header: ({ column }) => {
      const { t } = useTranslation();

      return (
        <Button
          variant="ghost"
          className="px-0 hover:bg-sidebar/80 hover:text-sidebar-foreground"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          {t("common.role")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { t } = useTranslation();

      return (
        <Badge variant="outline">
          {ROLE_LABEL_KEYS[row.original.userRole]
            ? t(ROLE_LABEL_KEYS[row.original.userRole])
            : row.original.userRole}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => {
      const { t } = useTranslation();

      return (
        <Button
          variant="ghost"
          className="px-0 hover:bg-sidebar/80 hover:text-sidebar-foreground"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          {t("common.status")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { t } = useTranslation();

      return (
        <Badge
          variant={
            row.original.isActive ? "default" : "destructive"
          }
        >
          {row.original.isActive
            ? t("common.active")
            : t("common.inactive")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdDate",
    header: ({ column }) => {
      const { t } = useTranslation();

      return (
        <Button
          variant="ghost"
          className="px-0 hover:bg-sidebar/80 hover:text-sidebar-foreground"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          {t("common.created")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) =>
      new Date(row.original.createdDate).toLocaleDateString(),
  },
  {
    id: "actions",
    enableSorting: false,
    header: () => {
      const { t } = useTranslation();

      return t("common.actions");
    },
    cell: ({ row }) => {
      const { t } = useTranslation();

      return (
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/users/${row.original.id}/edit`}>
              {t("common.edit")}
            </Link>
          </Button>

          <ResetPasswordDialog
            userId={row.original.id}
            userName={`${row.original.contactFirstName} ${row.original.contactLastName}`}
          />
        </div>
      );
    },
  },
];