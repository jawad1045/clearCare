"use client";

import { useMemo, useState } from "react";

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

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
          locale as "en" | "es"
        ),

      state:{
        sorting
      },

      onSortingChange:
        setSorting,

      getCoreRowModel:
        getCoreRowModel(),

      getSortedRowModel:
        getSortedRowModel(),

    });



  return (
    <div className="space-y-4">


      {/* Filters */}
      <div className="flex items-center justify-between gap-3">


        <div className="flex gap-3 overflow-x-auto">


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


        </div>




        <Input

          className="max-w-xs"

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


    </div>
  );
}