"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
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
import { formatDateTime } from "@/lib/format-date";
import { REFERRAL_STATUSES, getStatusColor } from "@/lib/referral-statuses";

const SERVICE_TYPES = ["Drug Test", "Physical", "Medication Management", "IOP"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type Referral = Awaited<ReturnType<typeof getMyReferrals>>[number];

type Props = {
  referrals: Referral[];
  basePath: string;
};

export function UserReferralsTable({ referrals, basePath }: Props) {
  const [search, setSearch] = useState("");
  const [filterService, setFilterService] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let result = q
      ? referrals.filter((r) =>
          `${r.patientFirstName ?? ""} ${r.patientLastName ?? ""}`.toLowerCase().includes(q) ||
          `${r.parentFirstName ?? ""} ${r.parentLastName ?? ""}`.toLowerCase().includes(q) ||
          r.serviceType.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q) ||
          String(r.id).includes(q)
        )
      : [...referrals];

    if (filterService !== "all") result = result.filter((r) => r.serviceType === filterService);
    if (filterStatus !== "all") result = result.filter((r) => r.status === filterStatus);
    if (filterMonth !== "all") {
      const idx = MONTHS.indexOf(filterMonth);
      result = result.filter((r) => new Date(r.dateOfReferral).getMonth() === idx);
    }

    return result;
  }, [referrals, search, filterService, filterStatus, filterMonth]);

  return (
    <div className="space-y-4">
      {/* Filters + search/New button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
        <Select value={filterService} onValueChange={setFilterService}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Service Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Service Types</SelectItem>
            {SERVICE_TYPES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {REFERRAL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {MONTHS.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        </div>
        <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by patient, parent, service, or status…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        </div>
      </div>

      <div className="border">
        <Table>
          <TableHeader className="bg-sidebar text-sidebar-foreground">
            <TableRow>
              <TableHead className="text-sidebar-foreground">ID</TableHead>
              <TableHead className="text-sidebar-foreground">Patient</TableHead>
              <TableHead className="text-sidebar-foreground">Parent</TableHead>
              <TableHead className="text-sidebar-foreground">Service Type</TableHead>
              <TableHead className="text-sidebar-foreground">Priority</TableHead>
              <TableHead className="text-sidebar-foreground">Status</TableHead>
              <TableHead className="text-sidebar-foreground">Created</TableHead>
              <TableHead className="text-sidebar-foreground">Last Updated</TableHead>
              <TableHead className="text-right text-sidebar-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-muted-foreground py-6"
                >
                  No referrals found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((referral, i) => (
                <TableRow key={referral.id} className="transition-colors hover:bg-muted/50" style={i % 2 === 0 ? { backgroundColor: "#F8FAFC" } : undefined}>
                  <TableCell>#{referral.id}</TableCell>
                  <TableCell className="font-medium">
                    {referral.patientFirstName ?? "-"}{" "}
                    {referral.patientLastName ?? "-"}
                  </TableCell>
                  <TableCell>
                    {referral.parentFirstName ?? "-"}{" "}
                    {referral.parentLastName ?? "-"}
                  </TableCell>
                  <TableCell>{referral.serviceType}</TableCell>
                  <TableCell>{referral.priority}</TableCell>
                  <TableCell>
                    <Badge
                      style={{ backgroundColor: getStatusColor(referral.status) + "22", color: getStatusColor(referral.status), borderColor: getStatusColor(referral.status) + "55" }}
                      variant="outline"
                    >
                      {referral.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDateTime(referral.dateOfReferral)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDateTime(referral.lastUpdated)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`${basePath}/${referral.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                      {referral.pdfResult ? (
                        <Link href={referral.pdfResult} target="_blank" rel="noopener noreferrer" download>
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <Download className="h-3.5 w-3.5" />
                            Result
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">No result</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
