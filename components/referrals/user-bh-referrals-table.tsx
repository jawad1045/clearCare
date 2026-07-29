"use client";

import { useState } from "react";

import {
  ColumnFiltersState,
  FilterFn,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { getMyBHReferrals } from "@/action/bh-referral.action";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Pagination } from "@/components/pagination";

import {
  MONTH_KEYS,
  MONTH_LABEL_KEYS,
} from "@/lib/referral-filters";

import {
  REFERRAL_STATUSES,
} from "@/lib/referral-statuses";

import { useTranslation } from "@/locale/use-translation";

import {
  columns,
  BHReferral,
} from "./user-bh-referrals-columns";

type Props = {
  referrals: BHReferral[];
  basePath: string;
};

const equalsFilter: FilterFn<BHReferral> = (
  row,
  columnId,
  filterValue
) => {
  if (
    filterValue === undefined ||
    filterValue === "all"
  )
    return true;

  return row.getValue(columnId) === filterValue;
};

const globalFilterFn: FilterFn<BHReferral> = (
  row,
  _columnId,
  filterValue
) => {
  const q = String(filterValue ?? "")
    .toLowerCase()
    .trim();

  if (!q) return true;

  const r = row.original;

  return (
    `${r.firstName} ${r.lastName}`
      .toLowerCase()
      .includes(q) ||
    r.status.toLowerCase().includes(q) ||
    String(r.id).includes(q)
  );
};

export function UserBHReferralsTable({
  referrals,
  basePath,
}: Props) {
  const { t, locale } = useTranslation();

  const [sorting, setSorting] =
    useState<SortingState>([]);

  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>([]);

  const [globalFilter, setGlobalFilter] =
    useState("");

  const [pageIndex, setPageIndex] =
    useState(0);

  const [pageSize, setPageSize] =
    useState(20);

  const [filterStatus, setFilterStatus] =
    useState("all");

  const [filterMonth, setFilterMonth] =
    useState("all");

  const table = useReactTable({
    data: referrals,
    columns: columns(
      basePath,
      t,
      locale as "en" | "es"
    ),

    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility: {
        month: false,
      },
      pagination: {
        pageIndex,
        pageSize,
      },
    },

    onSortingChange: setSorting,
    onColumnFiltersChange:
      setColumnFilters,
    onGlobalFilterChange:
      setGlobalFilter,

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

    globalFilterFn,

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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={filterStatus}
            onValueChange={(value) => {
              setFilterStatus(value);

              table
                .getColumn("status")
                ?.setFilterValue(
                  value === "all"
                    ? undefined
                    : value
                );

              setPageIndex(0);
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue
                placeholder={t(
                  "common.allStatuses"
                )}
              />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                {t("common.allStatuses")}
              </SelectItem>

              {REFERRAL_STATUSES.map(
                (status) => (
                  <SelectItem
                    key={status}
                    value={status}
                  >
                    {status}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>

          <Select
            value={filterMonth}
            onValueChange={(value) => {
              setFilterMonth(value);

              const index =
                value === "all"
                  ? undefined
                  : MONTH_KEYS.indexOf(
                      value as (typeof MONTH_KEYS)[number]
                    );

              table
                .getColumn("month")
                ?.setFilterValue(index);

              setPageIndex(0);
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue
                placeholder={t(
                  "common.allMonths"
                )}
              />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                {t("common.allMonths")}
              </SelectItem>

              {MONTH_KEYS.map((month) => (
                <SelectItem
                  key={month}
                  value={month}
                >
                  {t(
                    MONTH_LABEL_KEYS[
                      month
                    ]
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setPageIndex(0);
            }}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Rows" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="10">
                10 / page
              </SelectItem>
              <SelectItem value="20">
                20 / page
              </SelectItem>
              <SelectItem value="50">
                50 / page
              </SelectItem>
              <SelectItem value="100">
                100 / page
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Input
          className="max-w-xs"
          placeholder={t(
            "referrals.searchUserBhReferrals"
          )}
          value={globalFilter}
          onChange={(e) => {
            setGlobalFilter(
              e.target.value
            );
            setPageIndex(0);
          }}
        />
      </div>

      <div className="border">
        <Table>
          <TableHeader className="bg-sidebar text-sidebar-foreground">
            {table
              .getHeaderGroups()
              .map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                >
                  {headerGroup.headers.map(
                    (header) => (
                      <TableHead
                        key={header.id}
                        className="text-sidebar-foreground"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column
                                .columnDef
                                .header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  )}
                </TableRow>
              ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows
              .length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    table
                      .getVisibleFlatColumns()
                      .length
                  }
                  className="py-6 text-center text-muted-foreground"
                >
                  {t(
                    "referrals.noReferralsFound"
                  )}
                </TableCell>
              </TableRow>
            ) : (
              table
                .getRowModel()
                .rows.map(
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
                              cell.column
                                .columnDef
                                .cell,
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