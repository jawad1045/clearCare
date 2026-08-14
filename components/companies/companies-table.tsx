"use client";

import { useEffect, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { columns, Company } from "./columns";
import { useTranslation } from "@/locale/use-translation";

interface CompaniesTableProps {
  companies: Company[];
  onToggleCompanyActive?: (companyId: number, nextActive: boolean) => Promise<void> | void;
}

export function CompaniesTable({ companies, onToggleCompanyActive }: CompaniesTableProps) {
  const { t } = useTranslation();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [localCompanies, setLocalCompanies] = useState<Company[]>(companies);
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setLocalCompanies(companies);
  }, [companies]);

  const handleToggleActive = async (companyId: number, nextActive: boolean) => {
    const previous = localCompanies;

    setLocalCompanies((prev) =>
      prev.map((c) => (c.id === companyId ? { ...c, isActive: nextActive } : c))
    );
    setPendingIds((prev) => new Set(prev).add(companyId));

    try {
      await onToggleCompanyActive?.(companyId, nextActive);
    } catch (err) {
      setLocalCompanies(previous);
      console.error("Failed to update company status", err);
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(companyId);
        return next;
      });
    }
  };

  const table = useReactTable({
    data: localCompanies,
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
                {t("companies.noCompaniesFound")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}