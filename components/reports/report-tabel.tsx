"use client";

import { useState } from "react";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
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

import { Pagination } from "@/components/pagination";

import type { ReportRow } from "@/action/report.action";

type Props = {
  data: ReportRow[];
  columns: ColumnDef<ReportRow>[];
  emptyMessage: string;
};

export function ReportTable({
  data,
  columns,
  emptyMessage,
}: Props) {
  const [sorting, setSorting] =
    useState<SortingState>([]);

  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>([]);

  const [pageIndex, setPageIndex] =
    useState(0);

  const [pageSize, setPageSize] =
    useState(20);

  const table = useReactTable({
    data,
    columns,

    state: {
      sorting,
      columnFilters,
      pagination: {
        pageIndex,
        pageSize,
      },
    },

    onSortingChange: setSorting,

    onColumnFiltersChange:
      setColumnFilters,

    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({
              pageIndex,
              pageSize,
            })
          : updater;

      setPageIndex(next.pageIndex);
      setPageSize(next.pageSize);
    },

    getCoreRowModel:
      getCoreRowModel(),

    getFilteredRowModel:
      getFilteredRowModel(),

    getSortedRowModel:
      getSortedRowModel(),

    getPaginationRowModel:
      getPaginationRowModel(),
  });

  return (
    <div className="space-y-3">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader className="bg-sidebar text-sidebar-foreground">
            {table.getHeaderGroups().map(
              (headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(
                    (header) => (
                      <TableHead
                        key={header.id}
                        className="text-sidebar-foreground"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  )}
                </TableRow>
              )
            )}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    table.getVisibleFlatColumns()
                      .length
                  }
                  className="py-8 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(
                (row, index) => (
                  <TableRow
                    key={row.id}
                    className={`transition-colors hover:bg-muted/50 ${
                      index % 2 === 1
                        ? "table-row-even"
                        : "table-row-odd"
                    }`}
                  >
                    {row
                      .getVisibleCells()
                      .map((cell) => (
                        <TableCell
                          key={cell.id}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                  </TableRow>
                )
              )
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        page={pageIndex + 1}
        totalPages={Math.max(
          1,
          table.getPageCount()
        )}
        total={
          table.getFilteredRowModel()
            .rows.length
        }
        onPageChange={(page) =>
          setPageIndex(page - 1)
        }
      />
    </div>
  );
}