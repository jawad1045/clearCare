"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowUpDown, Download, Upload } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

type Referral = {
  id: number;
  patientFirstName: string;
  patientLastName: string;
  serviceType: string;
  priority: string;
  status: string;
  dateOfReferral: Date;
  lastUpdated: Date;
  pdfResult: string | null;
  user: {
    contactFirstName: string;
    contactLastName: string;
    contactEmail: string;
  };
  company: {
    organization: string;
  };
};

type Props = {
  referrals: Referral[];
  basePath: string;
};

export function AdminReferralsTable({ referrals, basePath }: Props) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "id-asc" | "id-desc">("newest");
  const [filterService, setFilterService] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterOrg, setFilterOrg] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");

  const orgs = useMemo(() => {
    const set = new Set(referrals.map((r) => r.company.organization));
    return Array.from(set).sort();
  }, [referrals]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let result = q
      ? referrals.filter((r) =>
          `${r.patientFirstName} ${r.patientLastName}`.toLowerCase().includes(q) ||
          `${r.user.contactFirstName} ${r.user.contactLastName}`.toLowerCase().includes(q) ||
          r.company.organization.toLowerCase().includes(q) ||
          r.serviceType.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q)
        )
      : [...referrals];

    if (filterService !== "all") result = result.filter((r) => r.serviceType === filterService);
    if (filterStatus !== "all") result = result.filter((r) => r.status === filterStatus);
    if (filterOrg !== "all") result = result.filter((r) => r.company.organization === filterOrg);
    if (filterMonth !== "all") {
      const idx = MONTHS.indexOf(filterMonth);
      result = result.filter((r) => new Date(r.dateOfReferral).getMonth() === idx);
    }

    result.sort((a, b) => {
      if (sort === "newest") return new Date(b.dateOfReferral).getTime() - new Date(a.dateOfReferral).getTime();
      if (sort === "oldest") return new Date(a.dateOfReferral).getTime() - new Date(b.dateOfReferral).getTime();
      if (sort === "id-asc") return a.id - b.id;
      return b.id - a.id;
    });

    return result;
  }, [referrals, search, sort, filterService, filterStatus, filterOrg, filterMonth]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-x-auto">
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
        <Select value={filterOrg} onValueChange={setFilterOrg}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Organizations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Organizations</SelectItem>
            {orgs.map((o) => (
              <SelectItem key={o} value={o}>{o}</SelectItem>
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
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="w-48">
            <ArrowUpDown className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Date: Newest first</SelectItem>
            <SelectItem value="oldest">Date: Oldest first</SelectItem>
            <SelectItem value="id-asc">ID: Ascending</SelectItem>
            <SelectItem value="id-desc">ID: Descending</SelectItem>
          </SelectContent>
        </Select>
        </div>
        <Input
          placeholder="Search by patient, user, company, service, or status…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                  No referrals found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((referral) => (
                <TableRow key={referral.id}>
                  <TableCell>#{referral.id}</TableCell>

                  <TableCell>
                    {referral.patientFirstName} {referral.patientLastName}
                  </TableCell>

                  <TableCell>
                    {referral.user.contactFirstName} {referral.user.contactLastName}
                  </TableCell>

                  <TableCell>{referral.company.organization}</TableCell>

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

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`${basePath}/${referral.id}`}>
                        <Button size="sm" variant="outline">View</Button>
                      </Link>
                      {referral.pdfResult ? (
                        <Link href={referral.pdfResult} target="_blank" rel="noopener noreferrer" download>
                          <Button size="sm" variant="outline" className="gap-1.5">
                            <Download className="h-3.5 w-3.5" />
                            Result
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`${basePath}/${referral.id}`}>
                          <Button size="sm" variant="outline" className="gap-1.5 text-muted-foreground">
                            <Upload className="h-3.5 w-3.5" />
                            Upload Result
                          </Button>
                        </Link>
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
