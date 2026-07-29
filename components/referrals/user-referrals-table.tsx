"use client";

import { useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react";

import {
  ColumnDef,
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

import { getMyReferrals } from "@/action/referral.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/pagination";
import { formatDateTime } from "@/lib/format-date";
import { REFERRAL_STATUSES, getStatusColor, getStatusLabel } from "@/lib/referral-statuses";
import {
  MONTH_KEYS,
  MONTH_LABEL_KEYS,
  SERVICE_TYPES,
  SERVICE_TYPE_LABEL_KEYS,
  getPriorityLabel,
} from "@/lib/referral-filters";
import { useTranslation } from "@/locale/use-translation";

type Referral = Awaited<ReturnType<typeof getMyReferrals>>["referrals"][number];

type Props = {
  referrals: Referral[];
  basePath: string;
};

// Exact-match filter, used for the service/status/month <Select> filters.
// (undefined filterValue means "no filter applied" -> keep the row.)
const equalsFilter: FilterFn<Referral> = (row, columnId, filterValue) => {
  if (filterValue === undefined || filterValue === "all") return true;
  return row.getValue(columnId) === filterValue;
};

// Free-text search across id/patient/parent/serviceType/status.
const globalFilterFn: FilterFn<Referral> = (row, _columnId, filterValue) => {
  const q = String(filterValue ?? "").toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    `${r.patientFirstName ?? ""} ${r.patientLastName ?? ""}`.toLowerCase().includes(q) ||
    `${r.parentFirstName ?? ""} ${r.parentLastName ?? ""}`.toLowerCase().includes(q) ||
    r.serviceType.toLowerCase().includes(q) ||
    r.status.toLowerCase().includes(q) ||
    String(r.id).includes(q)
  );
};

export function UserReferralsTable({ referrals, basePath }: Props) {
  const { t, locale } = useTranslation();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Local mirrors of the select values, purely for the controlled <Select> UI.
  const [filterService, setFilterService] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");

  const columns: ColumnDef<Referral>[] = [
    {
      id: "referralId",
      header: t("common.id"),
      accessorFn: (r) => r.id,
      cell: ({ row }) => `#${row.original.id}`,
    },
    {
      id: "patient",
      header: t("common.patient"),
      accessorFn: (r) => `${r.patientFirstName ?? ""} ${r.patientLastName ?? ""}`.trim(),
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.patientFirstName ?? "-"} {row.original.patientLastName ?? "-"}
        </span>
      ),
    },
    {
      id: "parent",
      header: t("common.parent"),
      accessorFn: (r) => `${r.parentFirstName ?? ""} ${r.parentLastName ?? ""}`.trim(),
      cell: ({ row }) => (
        <>
          {row.original.parentFirstName ?? "-"} {row.original.parentLastName ?? "-"}
        </>
      ),
    },
    {
      id: "serviceType",
      header: t("common.serviceType"),
      accessorFn: (r) => r.serviceType,
      filterFn: equalsFilter,
      cell: ({ row }) => {
        const st = row.original.serviceType as keyof typeof SERVICE_TYPE_LABEL_KEYS;
        return SERVICE_TYPE_LABEL_KEYS[st] ? t(SERVICE_TYPE_LABEL_KEYS[st]) : row.original.serviceType;
      },
    },
    {
      id: "priority",
      header: t("common.priority"),
      accessorFn: (r) => r.priority ?? "",
      cell: ({ row }) => getPriorityLabel(row.original.priority ?? "", t),
    },
    {
      id: "status",
      header: t("common.status"),
      accessorFn: (r) => r.status,
      filterFn: equalsFilter,
      cell: ({ row }) => {
        const status = row.original.status;
        const color = getStatusColor(status);
        return (
          <Badge
            style={{ backgroundColor: color + "22", color, borderColor: color + "55" }}
            variant="outline"
          >
            {getStatusLabel(status, locale)}
          </Badge>
        );
      },
    },
    {
      id: "month",
      header: "",
      accessorFn: (r) => new Date(r.dateOfReferral).getMonth(),
      filterFn: equalsFilter,
      cell: () => null,
    },
    {
      id: "created",
      header: t("common.created"),
      accessorFn: (r) => r.dateOfReferral,
      cell: ({ row }) => (
        <span className="whitespace-nowrap">{formatDateTime(row.original.dateOfReferral)}</span>
      ),
    },
    {
      id: "lastUpdated",
      header: t("common.lastUpdated"),
      accessorFn: (r) => r.lastUpdated,
      cell: ({ row }) => (
        <span className="whitespace-nowrap">{formatDateTime(row.original.lastUpdated)}</span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">{t("common.actions")}</div>,
      cell: ({ row }) => {
        const referral = row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <Link href={`${basePath}/${referral.id}`}>
              <Button variant="outline" size="sm">
                {t("common.view")}
              </Button>
            </Link>
            {referral.pdfResult ? (
              <Link href={referral.pdfResult} target="_blank" rel="noopener noreferrer" download>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  {t("common.result")}
                </Button>
              </Link>
            ) : (
              <span className="text-xs text-muted-foreground">{t("common.noResult")}</span>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: referrals,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility: { month: false },
      pagination: { pageIndex, pageSize },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater;
      setPageIndex(next.pageIndex);
      setPageSize(next.pageSize);
    },
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Filters + search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={filterService}
            onValueChange={(v) => {
              setFilterService(v);
              table.getColumn("serviceType")?.setFilterValue(v === "all" ? undefined : v);
              setPageIndex(0);
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder={t("common.allServiceTypes")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.allServiceTypes")}</SelectItem>
              {SERVICE_TYPES.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(SERVICE_TYPE_LABEL_KEYS[s])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterStatus}
            onValueChange={(v) => {
              setFilterStatus(v);
              table.getColumn("status")?.setFilterValue(v === "all" ? undefined : v);
              setPageIndex(0);
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder={t("common.allStatuses")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.allStatuses")}</SelectItem>
              {REFERRAL_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {getStatusLabel(s, locale)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterMonth}
            onValueChange={(v) => {
              setFilterMonth(v);
              const idx = v === "all" ? undefined : MONTH_KEYS.indexOf(v as (typeof MONTH_KEYS)[number]);
              table.getColumn("month")?.setFilterValue(idx);
              setPageIndex(0);
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder={t("common.allMonths")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.allMonths")}</SelectItem>
              {MONTH_KEYS.map((m) => (
                <SelectItem key={m} value={m}>
                  {t(MONTH_LABEL_KEYS[m])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v));
              setPageIndex(0);
            }}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Rows" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="20">20 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
              <SelectItem value="100">100 / page</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder={t("referrals.searchUserReferrals")}
            value={globalFilter}
            onChange={(e) => {
              setGlobalFilter(e.target.value);
              setPageIndex(0);
            }}
            className="max-w-xs"
          />
        </div>
      </div>

      <div className="border">
        <Table>
          <TableHeader className="bg-sidebar text-sidebar-foreground">
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
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleFlatColumns().length}
                  className="text-center text-muted-foreground py-6"
                >
                  {t("referrals.noReferralsFound")}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row, i) => (
                <TableRow
                  key={row.id}
                  className={`transition-colors hover:bg-muted/50 ${
                    i % 2 === 1 ? "table-row-even" : "table-row-odd"
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        page={pageIndex + 1}
        totalPages={Math.max(1, table.getPageCount())}
        total={table.getFilteredRowModel().rows.length}
        onPageChange={(p) => setPageIndex(p - 1)}
      />
    </div>
  );
}