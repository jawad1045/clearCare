"use client";

import Link from "next/link";
import { ArrowUpDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "../ui/switch";
import { useLocalFormatDate } from "@/hooks/use-local-format-date";

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    onToggleActive: (companyId: number, nextActive: boolean) => void;
    pendingIds: Set<number>;
  }
}
export type Company = {
  id: number;
  organization: string;
  city: string;
  state: string;
  contactEmail: string;
  contactPhone: string;
  createdDate: Date;
  isActive: boolean;
};

export const columns: ColumnDef<Company>[] = [
  {
    accessorKey: "organization",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Organization
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "contactEmail",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "contactPhone",
    header: "Phone",
  },
{
    accessorKey: "isActive",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row, table }) => {
      const company = row.original;
      const isPending = table.options.meta?.pendingIds.has(company.id);

      return (
        <div className="flex items-center gap-2">
          <Switch
            checked={company.isActive}
            disabled={isPending}
            onCheckedChange={(checked) =>
              table.options.meta?.onToggleActive(company.id, checked)
            }
            aria-label={company.isActive ? "Active" : "Inactive"}
          />
          <Badge variant={company.isActive ? "default" : "destructive"}>
            {company.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "location",
    header: "Location",
    accessorFn: (row) => `${row.city}, ${row.state}`,
  },
  {
    accessorKey: "createdDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Created
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const { formatDate } = useLocalFormatDate();
      return formatDate(row.original.createdDate);
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Button asChild size="sm" variant="outline">
        <Link href={`/admin/companies/${row.original.id}/edit`}>
          Edit
        </Link>
      </Button>
    ),
  },
];