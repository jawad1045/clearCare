"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useTranslation } from "@/locale/use-translation";
import { columns, User } from "./columns";

type Company = {
  id: number;
  organization: string;
};

type UsersTableProps = {
  users: User[];
  companies: Company[];
  activeAcctId: number | null;
  onCompanyChange: (acctId: number | null) => void;
  // Optional: wire this up to your API call. If omitted, toggling
  // only updates local state (useful for now / storybook / demos).
  onToggleUserActive?: (userId: number, nextActive: boolean) => Promise<void> | void;
};

export function UsersTable({ users, onToggleUserActive }: UsersTableProps) {
  const { t } = useTranslation();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [localUsers, setLocalUsers] = useState<User[]>(users);
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  // Keep local copy in sync if the parent's users list changes
  // (e.g. refetch, pagination, filters).
  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  const handleToggleActive = async (userId: number, nextActive: boolean) => {
    const previous = localUsers;

    // Optimistic update
    setLocalUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, active: nextActive } : u))
    );
    setPendingIds((prev) => new Set(prev).add(userId));

    try {
      await onToggleUserActive?.(userId, nextActive);
    } catch (err) {
      // Revert on failure
      setLocalUsers(previous);
      console.error("Failed to update user status", err);
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const table = useReactTable({
    data: localUsers,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      onToggleActive: handleToggleActive,
      pendingIds,
    },
  });

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-sidebar">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-sidebar-foreground">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  className={index % 2 === 0 ? "table-row-even" : "table-row-odd"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {t("users.noUsersFound")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}