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
  SERVICE_TYPES,
  SERVICE_TYPE_LABEL_KEYS,
} from "@/lib/referral-filters";

import {
  referralColumns,
  Referral,
} from "./referral-columns";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportToCSV, exportToPDF } from "@/lib/export-utils";
import { getReferralStatusHistory } from "@/action/referral.action";



type Props = {
  referrals: Referral[];
  basePath: string;
};


export function AdminReferralsTable({
  referrals,
  basePath,
}: Props) {

  const { t, locale } = useTranslation();


  const [sorting, setSorting] =
    useState<SortingState>([]);


  const [search, setSearch] =
    useState("");


  const [filterService, setFilterService] =
    useState("all");


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
          r => r.company.organization
        )
      )
    ).sort();

  }, [referrals]);



  const filtered = useMemo(() => {

    const q =
      search
        .toLowerCase()
        .trim();


    let result =
      q
      ?
      referrals.filter(r =>
        `${r.patientFirstName} ${r.patientLastName}`
          .toLowerCase()
          .includes(q)
        ||

        `${r.user.contactFirstName} ${r.user.contactLastName}`
          .toLowerCase()
          .includes(q)
        ||

        r.company.organization
          .toLowerCase()
          .includes(q)
        ||

        r.serviceType
          .toLowerCase()
          .includes(q)
        ||

        r.status
          .toLowerCase()
          .includes(q)
      )

      :

      [...referrals];



    if(filterService !== "all") {

      result =
        result.filter(
          r =>
            r.serviceType === filterService
        );

    }



    if(filterStatus !== "all") {

      result =
        result.filter(
          r =>
            r.status === filterStatus
        );

    }



    if(filterOrg !== "all") {

      result =
        result.filter(
          r =>
            r.company.organization === filterOrg
        );

    }



    if(filterMonth !== "all") {

      const index =
        MONTH_KEYS.indexOf(
          filterMonth as typeof MONTH_KEYS[number]
        );


      result =
        result.filter(
          r =>
            new Date(
              r.dateOfReferral
            ).getMonth() === index
        );

    }


    return result;


  },[
    referrals,
    search,
    filterService,
    filterStatus,
    filterOrg,
    filterMonth
  ]);



  const table =
    useReactTable({

      data: filtered,

      columns:
        referralColumns(
          basePath,
          t,
          locale as "en" | "es",
          getReferralStatusHistory,
        ),

      state:{
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


  // Reset to first page whenever a filter/search changes so we don't
  // land on a now-empty page.
  const filterKey = `${search}|${filterService}|${filterStatus}|${filterOrg}|${filterMonth}`;
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
        "Date of Birth",
        "Service Type",
        "Priority",
        "Status",
        "Date of Referral",
        "Parent First Name",
        "Parent Last Name",
        "Parent Email",
        "Parent Phone",
        "Race",
        "Gender",
        "SSN",
        "Type",
        "Referrer Name",
        "Date Patient Contact",
        "Method of Contact",
        "Notes",
        "Submitted By Name",
        "Submitted By Email",
        "Organization Name",
        "Company Address",
        "Company Phone"
      ];

      const rows = (filtered as any[]).map(r => [
        r.id,
        r.patientFirstName,
        r.patientLastName,
        r.dob ? new Date(r.dob).toLocaleDateString() : "",
        r.serviceType,
        r.priority || "",
        r.status,
        new Date(r.dateOfReferral).toLocaleDateString(),
        r.parentFirstName || "",
        r.parentLastName || "",
        r.parentEmail || "",
        r.parentPhone || "",
        r.race || "",
        r.gender || "",
        r.ssn || "",
        r.type || "",
        r.referName || "",
        r.datePatientContact ? new Date(r.datePatientContact).toLocaleDateString() : "",
        r.methodOfContact || "",
        r.notes || "",
        r.user ? `${r.user.contactFirstName} ${r.user.contactLastName}` : "",
        r.user?.contactEmail || "",
        r.company?.organization || "",
        r.company ? `${r.company.street || ""}, ${r.company.city || ""}, ${r.company.state || ""} ${r.company.zip || ""}` : "",
        r.company?.contactPhone || ""
      ]);

      exportToCSV("referrals_export.csv", headers, rows);
    } catch (error) {
      console.error("Export CSV failed", error);
    }
  };

  const handleExportPDF = async () => {
    try {
      const headers = [
        "ID",
        "Patient Name",
        "Service Type",
        "Priority",
        "Status",
        "Referrer",
        "Organization",
        "Date"
      ];

      const rows = (filtered as any[]).map(r => [
        r.id,
        `${r.patientFirstName} ${r.patientLastName}`,
        r.serviceType,
        r.priority || "",
        r.status,
        r.referName || "",
        r.company?.organization || "",
        new Date(r.dateOfReferral).toLocaleDateString()
      ]);

      await exportToPDF("referrals_export.pdf", "Referrals List", headers, rows);
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
              value={filterService}
              onValueChange={setFilterService}
            >

              <SelectTrigger className="w-44">
                <SelectValue
                  placeholder={
                    t("common.allServiceTypes")
                  }
                />
              </SelectTrigger>


              <SelectContent>

                <SelectItem value="all">
                  {t("common.allServiceTypes")}
                </SelectItem>


                {SERVICE_TYPES.map(service => (

                  <SelectItem
                    key={service}
                    value={service}
                  >

                    {
                      t(
                        SERVICE_TYPE_LABEL_KEYS[service]
                      )
                    }

                  </SelectItem>

                ))}


              </SelectContent>


            </Select>
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


                {REFERRAL_STATUSES.map(status => (

                  <SelectItem
                    key={status}
                    value={status}
                  >
                    {getStatusLabel(
                      status,
                      locale
                    )}
                  </SelectItem>

                ))}


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


                {orgs.map(org => (

                  <SelectItem
                    key={org}
                    value={org}
                  >
                    {org}
                  </SelectItem>

                ))}


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


                {MONTH_KEYS.map(month => (

                  <SelectItem
                    key={month}
                    value={month}
                  >

                    {t(
                      MONTH_LABEL_KEYS[month]
                    )}

                  </SelectItem>

                ))}


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
                "referrals.searchAdminReferrals"
              )
            }
            value={search}
            onChange={(e)=>
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

            {
              table
                .getHeaderGroups()
                .map(headerGroup => (

                  <TableRow
                    key={headerGroup.id}
                  >

                    {
                      headerGroup.headers.map(header => (

                        <TableHead
                          key={header.id}
                          className="text-sidebar-foreground"
                        >

                          {
                            header.isPlaceholder
                            ? null
                            :
                            flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )
                          }

                        </TableHead>

                      ))
                    }


                  </TableRow>

                ))
            }


          </TableHeader>





          <TableBody>


            {
              table.getRowModel().rows.length
              ?

              table
                .getRowModel()
                .rows
                .map(row => (

                  <TableRow

                    key={row.id}

                    className={`
                      
                      ${
                        row.index % 2 === 0
                        ? "table-row-even"
                        : "table-row-odd"
                      }
                    `}

                  >


                    {
                      row
                        .getVisibleCells()
                        .map(cell => (

                          <TableCell
                            key={cell.id}
                          >

                            {
                              flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )
                            }

                          </TableCell>


                        ))
                    }


                  </TableRow>


                ))


              :


              <TableRow>

                <TableCell

                  colSpan={
                    table
                      .getAllColumns()
                      .length
                  }

                  className="
                    h-24
                    text-center
                    text-muted-foreground
                  "

                >

                  {
                    t(
                      "referrals.noReferralsFound"
                    )
                  }


                </TableCell>


              </TableRow>


            }


          </TableBody>


        </Table>


      </div>


      <Pagination
        page={table.getState().pagination.pageIndex + 1}
        totalPages={Math.max(1, table.getPageCount())}
        total={filtered.length}
        onPageChange={(p) => table.setPageIndex(p - 1)}
      />


    </div>
  );
}