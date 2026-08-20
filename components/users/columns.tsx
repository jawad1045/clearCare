"use client";

import Link from "next/link";
import { ArrowUpDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResetPasswordDialog } from "@/components/users/reset-password-dialog";
import { useTranslation } from "@/locale/use-translation";
import { Switch } from "../ui/switch";
import { useLocalFormatDate } from "@/hooks/use-local-format-date";


declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    onToggleActive: (userId: number, nextActive: boolean) => void;
    pendingIds: Set<number>;
  }
}
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
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          {t("common.status")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row, table }) => {
      const { t } = useTranslation();
      const user = row.original;
      const isPending = table.options.meta?.pendingIds.has(user.id);

      return (
        <div className="flex items-center gap-2">
          <Switch
            checked={user.isActive}
            disabled={isPending}
            onCheckedChange={(checked) =>
              table.options.meta?.onToggleActive(user.id, checked)
            }
            aria-label={
              user.isActive ? t("common.active") : t("common.inactive")
            }
          />
          <Badge variant={user.isActive ? "default" : "destructive"}>
            {user.isActive ? t("common.active") : t("common.inactive")}
          </Badge>
        </div>
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
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          {t("common.created")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { formatDate } = useLocalFormatDate();
      return formatDate(row.original.createdDate);
    },
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