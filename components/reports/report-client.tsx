"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusBarChart } from "@/components/charts/status-bar-chart";
import { StatusPieChart } from "@/components/charts/status-pie-chart";
import { getStatusBadge, getStatusLabel, REFERRAL_STATUSES } from "@/lib/referral-statuses";
import { Download, FileText, Filter, BarChart3, Table, CheckCircle2, Clock, FileCheck } from "lucide-react";
import type { ReportRow } from "@/action/report.action";

const SERVICE_TYPES = [
  "Drug Test",
  "Physical",
  "Behavioral Health",
  "Medication Management",
  "IOP",
];

function exportCSV(rows: ReportRow[], isAdmin: boolean) {
  const headers = isAdmin
    ? ["ID", "Type", "Patient", "Company", "Service Type", "Status", "Date", "Referred By", "Has Result"]
    : ["ID", "Type", "Patient", "Company", "Service Type", "Status", "Date", "Has Result"];

  const csvRows = rows.map((r) => {
    const base = [
      r.id,
      r.type,
      `"${r.patientName}"`,
      `"${r.companyName}"`,
      r.serviceType,
      getStatusLabel(r.status),
      new Date(r.dateOfReferral).toLocaleDateString(),
    ];
    if (isAdmin) base.push(`"${r.referName}"`);
    base.push(r.hasPdfResult ? "Yes" : "No");
    return base.join(",");
  });

  const csv = [headers.join(","), ...csvRows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hwp-report-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportPDF() {
  window.print();
}

interface Props {
  rows: ReportRow[];
  isAdmin: boolean;
}

export function ReportClient({ rows, isAdmin }: Props) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (serviceFilter !== "all" && r.serviceType !== serviceFilter) return false;
      if (dateFrom && new Date(r.dateOfReferral) < new Date(dateFrom)) return false;
      if (dateTo && new Date(r.dateOfReferral) > new Date(dateTo + "T23:59:59")) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !r.patientName.toLowerCase().includes(q) &&
          !r.companyName.toLowerCase().includes(q) &&
          !r.referName.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [rows, typeFilter, statusFilter, serviceFilter, dateFrom, dateTo, search]);

  // Summary stats
  const total = filtered.length;
  const pending = filtered.filter((r) => r.status === "Pending").length;
  const completed = filtered.filter((r) => ["Clear", "Confirmed", "Ready"].includes(r.status)).length;
  const withResult = filtered.filter((r) => r.hasPdfResult).length;

  // Chart data
  const statusCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of filtered) map.set(r.status, (map.get(r.status) ?? 0) + 1);
    return [...map.entries()].map(([status, count]) => ({ status, count }));
  }, [filtered]);

  const bhStatusCounts = useMemo(
    () => statusCounts.filter(() => typeFilter === "BH Referral" || typeFilter === "all"),
    [statusCounts, typeFilter]
  );

  function clearFilters() {
    setTypeFilter("all");
    setStatusFilter("all");
    setServiceFilter("all");
    setDateFrom("");
    setDateTo("");
    setSearch("");
  }

  const hasActiveFilters =
    typeFilter !== "all" || statusFilter !== "all" || serviceFilter !== "all" || dateFrom || dateTo || search;

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Export buttons */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Table className="h-4 w-4" />
          <span>{total} record{total !== 1 ? "s" : ""} {hasActiveFilters ? "(filtered)" : ""}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCSV(filtered, isAdmin)} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportPDF} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Print header (only visible when printing) */}
      <div className="hidden print:block">
        <h1 className="text-xl font-bold">HWP Portal — Referral Report</h1>
        <p className="text-sm text-gray-500">Generated {new Date().toLocaleString()}</p>
      </div>

      {/* Filters */}
      <Card className="print:hidden">
        <CardHeader className="flex flex-row items-center gap-2 pb-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm">Filters</CardTitle>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="ml-auto text-xs text-muted-foreground underline hover:text-foreground">
              Clear all
            </button>
          )}
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="space-y-1.5">
              <Label className="text-xs">Search</Label>
              <Input
                placeholder="Patient, company…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="BH Referral">BH Referral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {REFERRAL_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{getStatusLabel(s)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Service Type</Label>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {SERVICE_TYPES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">From</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">To</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">Referrals + BH Referrals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completed}</div>
            <p className="text-xs text-muted-foreground">Clear / Confirmed / Ready</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">With Results</CardTitle>
            <FileCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{withResult}</div>
            <p className="text-xs text-muted-foreground">PDF result uploaded</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2 print:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <StatusBarChart data={statusCounts} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <StatusPieChart data={bhStatusCounts} />
          </CardContent>
        </Card>
      </div>

      {/* Data table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Referral Records</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">ID</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Patient</th>
                  <th className="px-4 py-3 text-left font-medium">Company</th>
                  <th className="px-4 py-3 text-left font-medium">Service</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  {isAdmin && <th className="px-4 py-3 text-left font-medium">Referred By</th>}
                  <th className="px-4 py-3 text-left font-medium">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 9 : 8} className="px-4 py-10 text-center text-muted-foreground">
                      No records match the current filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={`${r.type}-${r.id}`} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{r.id}</td>
                      <td className="px-4 py-3">
                        <Badge variant={r.type === "BH Referral" ? "default" : "secondary"} className="text-xs whitespace-nowrap">
                          {r.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-medium">{r.patientName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.companyName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.serviceType}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusBadge(r.status)}`}>
                          {getStatusLabel(r.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(r.dateOfReferral).toLocaleDateString()}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-muted-foreground">{r.referName}</td>
                      )}
                      <td className="px-4 py-3">
                        {r.hasPdfResult ? (
                          <span className="text-xs text-emerald-600 font-medium">Available</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
