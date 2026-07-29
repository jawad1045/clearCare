"use client";

import { useMemo, useRef, useState } from "react";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
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

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Pagination } from "@/components/pagination";

import { useTranslation } from "@/locale/use-translation";

import {
  REFERRAL_STATUSES,
  getStatusLabel,
} from "@/lib/referral-statuses";

import {
  MONTH_KEYS,
  MONTH_LABEL_KEYS,
} from "@/lib/referral-filters";

import { columns, BHReferral } from "./columns";


type Props = {
  referrals: BHReferral[];
  basePath: string;
};


export function AdminBHReferralsTable({
  referrals,
  basePath,
}: Props) {

  const { t, locale } = useTranslation();

  const tableLocale = locale as "en" | "es";


  const [sorting, setSorting] =
    useState<SortingState>([]);

  const [search, setSearch] =
    useState("");

  const [filterStatus, setFilterStatus] =
    useState("all");

  const [filterOrg, setFilterOrg] =
    useState("all");

  const [filterMonth, setFilterMonth] =
    useState("all");

  const [pageSize, setPageSize] =
    useState(20);

  const [pageIndex, setPageIndex] =
    useState(0);



  const orgs = useMemo(() => {

    return Array.from(
      new Set(
        referrals.map(
          (r) => r.company.organization
        )
      )
    ).sort();

  }, [referrals]);




  const filtered = useMemo(() => {

    const q =
      search
        .toLowerCase()
        .trim();


    let result = q
      ? referrals.filter((r) =>
        `${r.firstName} ${r.lastName}`
          .toLowerCase()
          .includes(q) ||

        `${r.user.contactFirstName} ${r.user.contactLastName}`
          .toLowerCase()
          .includes(q) ||

        r.company.organization
          .toLowerCase()
          .includes(q) ||

        r.status
          .toLowerCase()
          .includes(q) ||

        String(r.id)
          .includes(q)
      )
      : [...referrals];



    if (filterStatus !== "all") {
      result =
        result.filter(
          (r) =>
            r.status === filterStatus
        );
    }



    if (filterOrg !== "all") {
      result =
        result.filter(
          (r) =>
            r.company.organization === filterOrg
        );
    }



    if (filterMonth !== "all") {

      const monthIndex =
        MONTH_KEYS.indexOf(
          filterMonth as typeof MONTH_KEYS[number]
        );


      result =
        result.filter(
          (r) =>
            new Date(r.dateOfReferral)
              .getMonth() === monthIndex
        );
    }



    return result;


  }, [
    referrals,
    search,
    filterStatus,
    filterOrg,
    filterMonth,
  ]);





  const table = useReactTable({

    data: filtered,

    columns:
      columns(
        basePath,
        t,
        tableLocale
      ),

    state: {
      sorting,
      pagination: {
        pageIndex,
        pageSize,
      },
    },

    onSortingChange:
      setSorting,

    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(next.pageIndex);
      setPageSize(next.pageSize);
    },

    getCoreRowModel:
      getCoreRowModel(),

    getSortedRowModel:
      getSortedRowModel(),

    getPaginationRowModel:
      getPaginationRowModel(),

  });


  // Reset to page 1 whenever a filter/search changes so we don't land
  // on a now-empty page.
  const filterKey = `${search}|${filterStatus}|${filterOrg}|${filterMonth}`;
  const prevFilterKey = useRef(filterKey);
  if (prevFilterKey.current !== filterKey) {
    prevFilterKey.current = filterKey;
    if (pageIndex !== 0) setPageIndex(0);
  }




  return (

    <div className="space-y-4">


      {/* Filters */}

      <div className="flex items-center justify-between gap-3">


        <div className="flex gap-3 overflow-x-auto">
          <Select
            value={filterStatus}
            onValueChange={setFilterStatus}
          >
            <SelectTrigger className="w-36">
              <SelectValue
                placeholder={
                  t("common.allStatuses")
                }
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
                    {getStatusLabel(
                      status,
                      tableLocale
                    )}
                  </SelectItem>

                )
              )}

            </SelectContent>

          </Select>




          <Select
            value={filterOrg}
            onValueChange={setFilterOrg}
          >

            <SelectTrigger className="w-44">

              <SelectValue
                placeholder={
                  t("common.allOrganizations")
                }
              />

            </SelectTrigger>


            <SelectContent>

              <SelectItem value="all">
                {t("common.allOrganizations")}
              </SelectItem>


              {orgs.map(
                (org) => (

                  <SelectItem
                    key={org}
                    value={org}
                  >
                    {org}
                  </SelectItem>

                )
              )}

            </SelectContent>


          </Select>
          <Select
            value={filterMonth}
            onValueChange={setFilterMonth}
          >

            <SelectTrigger className="w-36">

              <SelectValue
                placeholder={
                  t("common.allMonths")
                }
              />

            </SelectTrigger>


            <SelectContent>

              <SelectItem value="all">
                {t("common.allMonths")}
              </SelectItem>


              {MONTH_KEYS.map(
                (month) => (

                  <SelectItem
                    key={month}
                    value={month}
                  >
                    {t(
                      MONTH_LABEL_KEYS[month]
                    )}
                  </SelectItem>

                )
              )}

            </SelectContent>

          </Select>


          <Select
            value={String(pageSize)}
            onValueChange={(value) => setPageSize(Number(value))}
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



        <Input

          className="max-w-xs"

          placeholder={
            t(
              "referrals.searchAdminBhReferrals"
            )
          }

          value={search}

          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }

        />


      </div>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-sidebar">
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
                            header.column.columnDef.header,
                            header.getContext()
                          )}

                      </TableHead>
                    )
                  )}
                </TableRow>

              ))}


          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (

              table
                .getRowModel()
                .rows
                .map((row) => (

                  <TableRow
                    key={row.id}
                    className={`transition-colors hover:bg-accent/50 ${row.index % 2 === 0
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

                ))

            ) : (

              <TableRow>

                <TableCell

                  colSpan={
                    columns(
                      basePath,
                      t,
                      tableLocale
                    ).length
                  }

                  className="h-24 text-center text-muted-foreground"

                >

                  {t(
                    "referrals.noReferralsFound"
                  )}

                </TableCell>

              </TableRow>

            )}


          </TableBody>


        </Table>


      </div>


      <Pagination
        page={pageIndex + 1}
        totalPages={Math.max(1, table.getPageCount())}
        total={filtered.length}
        onPageChange={(p) => setPageIndex(p - 1)}
      />


    </div>

  );
}