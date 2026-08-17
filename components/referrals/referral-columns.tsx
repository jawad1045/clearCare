"use client";

import Link from "next/link";
import { ArrowUpDown, Download, Upload } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { formatDateTime } from "@/lib/format-date";
import {
  getStatusColor,
  getStatusLabel,
} from "@/lib/referral-statuses";

import {
  SERVICE_TYPE_LABEL_KEYS,
} from "@/lib/referral-filters";

import { StatusHistoryHoverCell } from "@/components/status-history-hover-cell";
import type { StatusHistoryEntry } from "@/types/status-history";


export type Referral = {
  id: number;
  patientFirstName: string;
  patientLastName: string;
  serviceType: string;
  priority: string | null;
  status: string;
  dateOfReferral: Date;
  lastUpdated: Date;
  pdfResult: string | null;

  user: {
    contactFirstName: string;
    contactLastName: string;
    contactEmail: string;
  };

  company:{
    organization:string;
  };
};


type TranslationFunction = (
  key: any,
  vars?: Record<string,string|number>
)=>string;


export const referralColumns = (
  basePath:string,
  t:TranslationFunction,
  locale:"en"|"es",
  fetchStatusHistory: (referralId: number) => Promise<StatusHistoryEntry[]>
):ColumnDef<Referral>[] => [

{
 accessorKey:"id",

 header:({column})=>(
   <Button
    variant="ghost"
    className="px-0 text-sidebar-foreground"
    onClick={()=>column.toggleSorting(
      column.getIsSorted()==="asc"
    )}
   >
    {t("common.id")}
    <ArrowUpDown className="ml-2 h-4 w-4"/>
   </Button>
 ),

 cell:({row})=>(
   <>#{row.original.id}</>
 )
},



{
 id:"patient",

 accessorFn:(row)=>
 `${row.patientFirstName} ${row.patientLastName}`,

 header:({column})=>(
   <Button
    variant="ghost"
    className="px-0"
    onClick={()=>column.toggleSorting(
      column.getIsSorted()==="asc"
    )}
   >
    {t("common.patient")}
    <ArrowUpDown className="ml-2 h-4 w-4"/>
   </Button>
 ),

 cell:({row})=>(
   <>
   {row.original.patientFirstName}{" "}
   {row.original.patientLastName}
   </>
 )
},



{
 id:"company",

 accessorFn:(row)=>row.company.organization,

 header:({column})=>(
   <Button
    variant="ghost"
    className="px-0"
    onClick={()=>column.toggleSorting(
      column.getIsSorted()==="asc"
    )}
   >
    {t("common.company")}
    <ArrowUpDown className="ml-2 h-4 w-4"/>
   </Button>
 ),

 cell:({row})=>row.original.company.organization
},



{
 accessorKey:"serviceType",

 header:({column})=>(
   <Button
    variant="ghost"
    className="px-0"
    onClick={()=>column.toggleSorting(
      column.getIsSorted()==="asc"
    )}
   >
    {t("common.service")}
    <ArrowUpDown className="ml-2 h-4 w-4"/>
   </Button>
 ),

 cell:({row})=>{
   const key = SERVICE_TYPE_LABEL_KEYS[row.original.serviceType as keyof typeof SERVICE_TYPE_LABEL_KEYS];
   return key ? t(key) : row.original.serviceType;
 }
},



{
 accessorKey:"priority",

 header:({column})=>(
   <Button
    variant="ghost"
    className="px-0"
    onClick={()=>column.toggleSorting(
      column.getIsSorted()==="asc"
    )}
   >
    {t("common.priority")}
    <ArrowUpDown className="ml-2 h-4 w-4"/>
   </Button>
 )
},



{
 accessorKey:"status",

 header:({column})=>(
   <Button
    variant="ghost"
    className="px-0"
    onClick={()=>column.toggleSorting(
      column.getIsSorted()==="asc"
    )}
   >
    {t("common.status")}
    <ArrowUpDown className="ml-2 h-4 w-4"/>
   </Button>
 ),

 // Changed: badge is now the HoverCard trigger; history is fetched lazily on hover
 cell:({row})=>{

 const status=row.original.status;
 const color=getStatusColor(status);

 return (
  <StatusHistoryHoverCell
   referralId={row.original.id}
   locale={locale}
   t={t}
   fetchStatusHistory={fetchStatusHistory}
  >
   <Badge
    variant="outline"
    className="cursor-default"
    style={{
     backgroundColor:color+"22",
     color,
     borderColor:color+"55"
    }}
   >
    {getStatusLabel(status,locale)}
   </Badge>
  </StatusHistoryHoverCell>
 )

 }
},



{
 accessorKey:"dateOfReferral",

 header:({column})=>(
 <Button
 variant="ghost"
 className="px-0"
 onClick={()=>column.toggleSorting(
 column.getIsSorted()==="asc"
 )}
 >
 {t("common.created")}
 <ArrowUpDown className="ml-2 h-4 w-4"/>
 </Button>
 ),

 cell:({row})=>
 formatDateTime(row.original.dateOfReferral)
},



{
 accessorKey:"lastUpdated",

 header:({column})=>(
 <Button
 variant="ghost"
 className="px-0"
 onClick={()=>column.toggleSorting(
 column.getIsSorted()==="asc"
 )}
 >
 {t("common.lastUpdated")}
 <ArrowUpDown className="ml-2 h-4 w-4"/>
 </Button>
 ),

 cell:({row})=>
 formatDateTime(row.original.lastUpdated)
},


{
 id: "actions",

 enableSorting: false,

 header: () => t("common.actions"),

 cell: ({ row }) => {
  const referral = row.original;

  return (
   <div className="flex items-center gap-2">

    <Button
     asChild
     size="sm"
     variant="outline"
    >
     <Link href={`${basePath}/${referral.id}`}>
      {t("common.view")}
     </Link>
    </Button>

    {
     referral.pdfResult
     ?
     <Button
      asChild
      size="sm"
      variant="outline"
      className="gap-1.5"
     >
      <Link
       href={referral.pdfResult}
       target="_blank"
       rel="noopener noreferrer"
       download
      >
       <Download className="h-3.5 w-3.5" />
       {t("common.result")}
      </Link>
     </Button>
     :
     <Button
      asChild
      size="sm"
      variant="outline"
      className="gap-1.5 text-muted-foreground"
     >
      <Link href={`${basePath}/${referral.id}`}>
       <Upload className="h-3.5 w-3.5" />
       {t("common.uploadResult")}
      </Link>
     </Button>
    }

   </div>
  );
 },
},

];