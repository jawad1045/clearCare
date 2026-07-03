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
import { REFERRAL_STATUSES, getStatusColor, getStatusLabel } from "@/lib/referral-statuses";
import { MONTH_KEYS, MONTH_LABEL_KEYS, SERVICE_TYPES, SERVICE_TYPE_LABEL_KEYS } from "@/lib/referral-filters";
import { useTranslation } from "@/locale/use-translation";

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
  const { t, locale } = useTranslation();
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
      const idx = MONTH_KEYS.indexOf(filterMonth as (typeof MONTH_KEYS)[number]);
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
            <SelectValue placeholder={t("common.allServiceTypes")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.allServiceTypes")}</SelectItem>
            {SERVICE_TYPES.map((s) => (
              <SelectItem key={s} value={s}>{t(SERVICE_TYPE_LABEL_KEYS[s])}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder={t("common.allStatuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.allStatuses")}</SelectItem>
            {REFERRAL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{getStatusLabel(s, locale)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterOrg} onValueChange={setFilterOrg}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t("common.allOrganizations")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.allOrganizations")}</SelectItem>
            {orgs.map((o) => (
              <SelectItem key={o} value={o}>{o}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder={t("common.allMonths")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.allMonths")}</SelectItem>
            {MONTH_KEYS.map((m) => (
              <SelectItem key={m} value={m}>{t(MONTH_LABEL_KEYS[m])}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="w-48">
            <ArrowUpDown className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t("common.sortNewest")}</SelectItem>
            <SelectItem value="oldest">{t("common.sortOldest")}</SelectItem>
            <SelectItem value="id-asc">{t("common.sortIdAsc")}</SelectItem>
            <SelectItem value="id-desc">{t("common.sortIdDesc")}</SelectItem>
          </SelectContent>
        </Select>
        </div>
        <Input
          placeholder={t("referrals.searchAdminReferrals")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="border">
        <Table>
          <TableHeader className="bg-sidebar text-sidebar-foreground">
            <TableRow>
              <TableHead className="text-sidebar-foreground">{t("common.id")}</TableHead>
              <TableHead className="text-sidebar-foreground">{t("common.patient")}</TableHead>
              <TableHead className="text-sidebar-foreground">{t("common.submittedBy")}</TableHead>
              <TableHead className="text-sidebar-foreground">{t("common.company")}</TableHead>
              <TableHead className="text-sidebar-foreground">{t("common.service")}</TableHead>
              <TableHead className="text-sidebar-foreground">{t("common.priority")}</TableHead>
              <TableHead className="text-sidebar-foreground">{t("common.status")}</TableHead>
              <TableHead className="text-sidebar-foreground">{t("common.created")}</TableHead>
              <TableHead className="text-sidebar-foreground">{t("common.lastUpdated")}</TableHead>
              <TableHead className="w-20 text-sidebar-foreground">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">
                  {t("referrals.noReferralsFound")}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((referral, i) => (
                <TableRow key={referral.id} className="transition-colors hover:bg-muted/50"
                style={i % 2 === 1 ? { backgroundColor: "#f8fafc" } : { backgroundColor: "#ffffff" }}
                >
                  <TableCell>#{referral.id}</TableCell>

                  <TableCell>
                    {referral.patientFirstName} {referral.patientLastName}
                  </TableCell>

                  <TableCell>
                    {referral.user.contactFirstName} {referral.user.contactLastName}
                  </TableCell>

                  <TableCell>{referral.company.organization}</TableCell>

                  <TableCell>{SERVICE_TYPE_LABEL_KEYS[referral.serviceType as keyof typeof SERVICE_TYPE_LABEL_KEYS] ? t(SERVICE_TYPE_LABEL_KEYS[referral.serviceType as keyof typeof SERVICE_TYPE_LABEL_KEYS]) : referral.serviceType}</TableCell>

                  <TableCell>{referral.priority}</TableCell>

                  <TableCell>
                    <Badge
                      style={{ backgroundColor: getStatusColor(referral.status) + "22", color: getStatusColor(referral.status), borderColor: getStatusColor(referral.status) + "55" }}
                      variant="outline"
                    >
                      {getStatusLabel(referral.status, locale)}
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
                        <Button size="sm" variant="outline">{t("common.view")}</Button>
                      </Link>
                      {referral.pdfResult ? (
                        <Link href={referral.pdfResult} target="_blank" rel="noopener noreferrer" download>
                          <Button size="sm" variant="outline" className="gap-1.5">
                            <Download className="h-3.5 w-3.5" />
                            {t("common.result")}
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`${basePath}/${referral.id}`}>
                          <Button size="sm" variant="outline" className="gap-1.5 text-muted-foreground">
                            <Upload className="h-3.5 w-3.5" />
                            {t("common.uploadResult")}
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
