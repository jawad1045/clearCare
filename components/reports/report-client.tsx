"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { StatusBarChart } from "@/components/charts/status-bar-chart";
import { ServiceTypeBarChart } from "@/components/charts/service-type-bar-chart";
import { getStatusBadge, getStatusLabel, REFERRAL_STATUSES } from "@/lib/referral-statuses";
import { Download, FileText, Filter, Table, BarChart3, Clock, CheckCircle2, FileCheck } from "lucide-react";
import type { ReportRow } from "@/action/report.action";

const SERVICE_TYPES = [
  "Drug Test",
  "Physical",
  "Behavioral Health",
  "Medication Management",
  "IOP",
];

function exportCSV(rows: ReportRow[], isAdmin: boolean, filename: string) {
  const headers = isAdmin
    ? ["ID", "Patient", "Company", "Service Type", "Status", "Date", "Referred By", "Has Result"]
    : ["ID", "Patient", "Company", "Service Type", "Status", "Date", "Has Result"];

  const csvRows = rows.map((r) => {
    const base = [
      r.id,
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
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
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

  const total = filtered.length;
  const pending = filtered.filter((r) => r.status === "Pending").length;
  const completed = filtered.filter((r) => ["Clear", "Confirmed", "Ready"].includes(r.status)).length;
  const withResult = filtered.filter((r) => r.hasPdfResult).length;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  const referralRows = useMemo(() => filtered.filter((r) => r.type === "Referral"), [filtered]);
  const bhReferralRows = useMemo(() => filtered.filter((r) => r.type === "BH Referral"), [filtered]);

  // Chart data
  function countByStatus(rows: ReportRow[]) {
    const map = new Map<string, number>();
    for (const r of rows) map.set(r.status, (map.get(r.status) ?? 0) + 1);
    return [...map.entries()].map(([status, count]) => ({ status, count }));
  }

  const statusCounts = useMemo(() => countByStatus(referralRows), [referralRows]);
  const bhStatusCounts = useMemo(() => countByStatus(bhReferralRows), [bhReferralRows]);

  const serviceTypeCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of referralRows) map.set(r.serviceType, (map.get(r.serviceType) ?? 0) + 1);
    if (bhReferralRows.length > 0) map.set("Behavioral Health", bhReferralRows.length);
    return [...map.entries()].map(([label, count]) => ({ label, count }));
  }, [referralRows, bhReferralRows]);

  const topCompanies = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of filtered) map.set(r.companyName, (map.get(r.companyName) ?? 0) + 1);
    return [...map.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filtered]);

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
          <Button variant="outline" size="sm" onClick={exportPDF} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Print header (only visible when printing) */}
      <div className="hidden print:block">
        <h1 className="text-xl font-bold">HWP Portal — Referral Report</h1>
        <p className="text-sm text-gray-500" suppressHydrationWarning>Generated {new Date().toLocaleString()}</p>
      </div>

      {/* Filters */}
      <Card>
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
          <div className="flex gap-2">
            {/* Search — wider */}
            <div className="flex w-80 shrink-0 flex-col gap-1.5">
              <Label className="text-xs">Search</Label>
              <Input
                placeholder="Patient, company…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 text-sm"
              />
            </div>

            {/* Other filters — tight row */}
            <div className="flex flex-1 gap-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-8 w-32 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="BH Referral">BH Referral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 w-36 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {REFERRAL_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{getStatusLabel(s)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Service Type</Label>
                <Select value={serviceFilter} onValueChange={setServiceFilter}>
                  <SelectTrigger className="h-8 w-40 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {SERVICE_TYPES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">From</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-8 w-36 text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">To</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-8 w-36 text-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary stat cards */}
      {/* <div className="grid grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-sidebar">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#007A7D]">Total Records</CardTitle>
            <BarChart3 className="h-5 w-5 text-[#007A7D]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#007A7D]">{total}</div>
            <p className="text-xs text-muted-foreground">Referrals + BH Referrals</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-sidebar">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#007A7D]">Pending</CardTitle>
            <Clock className="h-5 w-5 text-[#007A7D]" />
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold text-[#007A7D]">{pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </div>
            <span className="text-sm font-semibold text-muted-foreground">{pct(pending)}%</span>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-sidebar">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#007A7D]">Completed</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-[#007A7D]" />
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold text-[#007A7D]">{completed}</div>
              <p className="text-xs text-muted-foreground">Clear / Confirmed / Ready</p>
            </div>
            <span className="text-sm font-semibold text-muted-foreground">{pct(completed)}%</span>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-sidebar">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#007A7D]">With Results</CardTitle>
            <FileCheck className="h-5 w-5 text-[#007A7D]" />
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold text-[#007A7D]">{withResult}</div>
              <p className="text-xs text-muted-foreground">PDF result uploaded</p>
            </div>
            <span className="text-sm font-semibold text-muted-foreground">{pct(withResult)}%</span>
          </CardContent>
        </Card>
      </div> */}

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4 print:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-brand">Referral Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <StatusBarChart data={statusCounts} />
          </CardContent>
        </Card>

        <Card >
          <CardHeader>
            <CardTitle className="text-sm font-medium text-brand">BH Referral Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <StatusBarChart data={bhStatusCounts} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-brand">Referrals by Service Type</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ServiceTypeBarChart data={serviceTypeCounts} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-brand">Top Companies by Referrals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCompanies.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="w-5 text-xs font-bold text-muted-foreground">{i + 1}.</span>
                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{c.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{c.count}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-primary"
                      style={{ width: `${(c.count / topCompanies[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {topCompanies.length === 0 && (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Referral Records table */}
      <Card className="border-t-4 border-t-sidebar">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-brand">Referral Records</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportCSV(referralRows, isAdmin, "hwp-referrals")}
            className="flex items-center gap-2 print:hidden"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-sm print:w-full print:table-fixed print:text-[10px]">
              <thead>
                <tr className="border-b bg-sidebar text-xs text-sidebar-foreground">
                  <th className="px-4 py-3 text-left font-semibold">ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Patient</th>
                  <th className="px-4 py-3 text-left font-semibold">Company</th>
                  <th className="px-4 py-3 text-left font-semibold">Service</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  {isAdmin && <th className="px-4 py-3 text-left font-semibold">Referred By</th>}
                  <th className="px-4 py-3 text-left font-semibold">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {referralRows.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} className="px-4 py-10 text-center text-muted-foreground">
                      No referral records match the current filters.
                    </td>
                  </tr>
                ) : (
                  referralRows.map((r, i) => (
                    <tr
                      key={`${r.type}-${r.id}`}
                      className="transition-colors hover:bg-muted/50"
                      style={i % 2 === 1 ? { backgroundColor: "rgba(0,122,125,0.08)" } : undefined}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{r.id}</td>
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

      {/* BH Referral Records table */}
      <Card className="border-t-4 border-t-sidebar">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-brand">BH Referral Records</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportCSV(bhReferralRows, isAdmin, "hwp-bh-referrals")}
            className="flex items-center gap-2 print:hidden"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-sm print:w-full print:table-fixed print:text-[10px]">
              <thead>
                <tr className="border-b bg-sidebar text-xs text-sidebar-foreground">
                  <th className="px-4 py-3 text-left font-semibold">ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Patient</th>
                  <th className="px-4 py-3 text-left font-semibold">Company</th>
                  <th className="px-4 py-3 text-left font-semibold">Service</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  {isAdmin && <th className="px-4 py-3 text-left font-semibold">Referred By</th>}
                  <th className="px-4 py-3 text-left font-semibold">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bhReferralRows.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} className="px-4 py-10 text-center text-muted-foreground">
                      No BH referral records match the current filters.
                    </td>
                  </tr>
                ) : (
                  bhReferralRows.map((r, i) => (
                    <tr
                      key={`${r.type}-${r.id}`}
                      className="transition-colors hover:bg-muted/50"
                      style={i % 2 === 1 ? { backgroundColor: "rgba(0,122,125,0.08)" } : undefined}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{r.id}</td>
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
