"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { getMyBHReferrals } from "@/action/bh-referral.action";
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
import { REFERRAL_STATUSES, getStatusColor, getStatusLabel } from "@/lib/referral-statuses";
import { MONTH_KEYS, MONTH_LABEL_KEYS } from "@/lib/referral-filters";
import { useTranslation } from "@/locale/use-translation";

type BHReferral = Awaited<ReturnType<typeof getMyBHReferrals>>[number];

type Props = {
  referrals: BHReferral[];
  basePath: string;
};

export function UserBHReferralsTable({ referrals, basePath }: Props) {
  const { t, locale } = useTranslation();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let result = q
      ? referrals.filter((r) =>
          `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q) ||
          String(r.id).includes(q)
        )
      : [...referrals];

    if (filterStatus !== "all") result = result.filter((r) => r.status === filterStatus);
    if (filterMonth !== "all") {
      const idx = MONTH_KEYS.indexOf(filterMonth as (typeof MONTH_KEYS)[number]);
      result = result.filter((r) => new Date(r.dateOfReferral).getMonth() === idx);
    }

    return result;
  }, [referrals, search, filterStatus, filterMonth]);

  return (
    <div className="space-y-4">
      {/* Filters + search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
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
        </div>
        <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder={t("referrals.searchUserBhReferrals")}
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
              <TableHead className="text-sidebar-foreground">{t("common.id")}</TableHead>
              <TableHead className="text-sidebar-foreground">{t("common.client")}</TableHead>
              <TableHead className="text-sidebar-foreground">{t("common.phone")}</TableHead>
              <TableHead className="text-sidebar-foreground">{t("common.status")}</TableHead>
              <TableHead className="text-sidebar-foreground">{t("common.created")}</TableHead>
              <TableHead className="text-sidebar-foreground">{t("common.lastUpdated")}</TableHead>
              <TableHead className="text-right text-sidebar-foreground">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-6"
                >
                  {t("referrals.noReferralsFound")}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((referral, i) => (
                <TableRow key={referral.id} 
                className={`transition-colors hover:bg-muted/50 
                  ${i % 2 === 1 ? "table-row-even" : "table-row-odd"}`}
                  >
                  <TableCell>#{referral.id}</TableCell>
                  <TableCell className="font-medium">
                    {referral.firstName} {referral.lastName}
                  </TableCell>
                  <TableCell>{referral.phone}</TableCell>
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
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`${basePath}/${referral.id}`}>
                        <Button variant="outline" size="sm">{t("common.view")}</Button>
                      </Link>
                      {referral.pdfReport ? (
                        <Link href={referral.pdfReport} target="_blank" rel="noopener noreferrer" download>
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <Download className="h-3.5 w-3.5" />
                            {t("common.result")}
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">{t("common.noResult")}</span>
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
