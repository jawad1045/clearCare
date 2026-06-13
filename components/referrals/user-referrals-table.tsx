"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Download } from "lucide-react";
import { getMyReferrals } from "@/action/referral.action";
import { Button } from "@/components/ui/button";
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
import { formatDate } from "@/lib/format-date";

const SERVICE_TYPES = ["Drug Test", "Physical", "Medication Management", "IOP"];
const STATUSES = ["Pending", "Approved", "Rejected", "Completed"];
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
  const [filterService, setFilterService] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");

  const filtered = useMemo(() => {
    let result = [...referrals];

    if (filterService !== "all") result = result.filter((r) => r.serviceType === filterService);
    if (filterStatus !== "all") result = result.filter((r) => r.status === filterStatus);
    if (filterMonth !== "all") {
      const idx = MONTHS.indexOf(filterMonth);
      result = result.filter((r) => new Date(r.dateOfReferral).getMonth() === idx);
    }

    return result;
  }, [referrals, filterService, filterStatus, filterMonth]);

  return (
    <div className="space-y-4">
      {/* Filters + New button */}
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
            {STATUSES.map((s) => (
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
        <Link href={`${basePath}/create`}>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            New Referral
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-6"
                >
                  No referrals found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((referral) => (
                <TableRow key={referral.id}>
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
                      variant={
                        referral.status === "Approved"
                          ? "default"
                          : referral.status === "Rejected"
                          ? "destructive"
                          : referral.status === "Completed"
                          ? "outline"
                          : "secondary"
                      }
                      className="capitalize"
                    >
                      {referral.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDate(referral.dateOfReferral)}
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
