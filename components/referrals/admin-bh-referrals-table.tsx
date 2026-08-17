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
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportToCSV, exportToPDF } from "@/lib/export-utils";
import { getBHReferralStatusHistory } from "@/action/bh-referral.action";



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
        tableLocale,
        getBHReferralStatusHistory
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

  const handleExportCSV = () => {
    try {
      const headers = [
        "Referral ID",
        "Patient First Name",
        "Patient Last Name",
        "Phone",
        "Email",
        "Last 4 SSN",
        "Gender",
        "Grade",
        "Referral Type",
        "Referrer Name",
        "Status",
        "Date of Referral",
        "Appointment Date",
        "Notes",
        "Submitted By Name",
        "Submitted By Email",
        "Organization Name",
        "Company Address",
        "Company Phone"
      ];

      const rows = (filtered as any[]).map(r => [
        r.id,
        r.firstName,
        r.lastName,
        r.phone,
        r.email || "",
        r.last4SSN || "",
        r.gender,
        r.grade || "",
        r.referralType || "",
        r.referName || "",
        r.status,
        new Date(r.dateOfReferral).toLocaleDateString(),
        r.appointmentDate ? new Date(r.appointmentDate).toLocaleDateString() : "",
        r.notes || "",
        r.user ? `${r.user.contactFirstName} ${r.user.contactLastName}` : "",
        r.user?.contactEmail || "",
        r.company?.organization || "",
        r.company ? `${r.company.street || ""}, ${r.company.city || ""}, ${r.company.state || ""} ${r.company.zip || ""}` : "",
        r.company?.contactPhone || ""
      ]);

      exportToCSV("bh_referrals_export.csv", headers, rows);
    } catch (error) {
      console.error("Export CSV failed", error);
    }
  };

  const handleExportPDF = async () => {
    try {
      const headers = [
        "ID",
        "Patient Name",
        "Phone",
        "Referral Type",
        "Referrer",
        "Status",
        "Organization",
        "Date"
      ];

      const rows = (filtered as any[]).map(r => [
        r.id,
        `${r.firstName} ${r.lastName}`,
        r.phone,
        r.referralType || "",
        r.referName || "",
        r.status,
        r.company?.organization || "",
        new Date(r.dateOfReferral).toLocaleDateString()
      ]);

      await exportToPDF("bh_referrals_export.pdf", "Medical Referrals", headers, rows);
    } catch (error) {
      console.error("Export PDF failed", error);
    }
  };

  return (

    <div className="space-y-4">


      {/* Filters */}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

        {/* Left: Filter dropdowns */}
        <div className="flex flex-wrap gap-3 overflow-x-auto">
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

        {/* Right: Search + Export buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Input
            className="w-56"
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
          <Button onClick={handleExportCSV} variant="outline" size="sm" className="flex items-center gap-1.5 whitespace-nowrap">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={handleExportPDF} variant="outline" size="sm" className="flex items-center gap-1.5 whitespace-nowrap">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>


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
                      tableLocale,
                      getBHReferralStatusHistory
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