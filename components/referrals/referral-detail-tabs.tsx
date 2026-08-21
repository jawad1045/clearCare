"use client";

import { useState, useEffect } from "react";
import { Eye, Settings, User, Paperclip, UserCheck, Activity, FileOutput, Calendar, Hash, ShieldCheck, FileText, Loader2, Edit } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UpdateStatusForm } from "@/components/referrals/status-selector";
import { ResultUploader } from "@/components/referrals/result-uploader";
import { parseAttachment } from "@/lib/parse-attachment";
import { getStatusColor, getStatusLabel } from "@/lib/referral-statuses";
import { SERVICE_TYPE_LABEL_KEYS, getPriorityLabel } from "@/lib/referral-filters";
import { useTranslation } from "@/locale/use-translation";
import { useLocalFormatDate } from "@/hooks/use-local-format-date";
import { EditReferralForm } from "./admin-edit-referral-form";
import type { StatusHistoryEntry } from "@/types/status-history";

type Referral = {
  id: number;
  serviceType: string;
  parentFirstName: string | null;
  parentLastName: string | null;
  parentEmail: string | null;
  parentPhone: string | null;
  patientFirstName: string;
  patientLastName: string;
  dob: Date;
  grade: string | null;
  race: string;
  gender: string;
  ssn: string;
  type: string | null;
  priority: string | null;
  status: string;
  dateOfReferral: Date;
  referName: string;
  datePatientContact: Date | null;
  methodOfContact: string | null;
  pdfResult: string | null;
  clientAttachments: string[];
  notes: string | null;
  lastUpdated: Date;
  user: {
    contactFirstName: string;
    contactLastName: string;
    contactEmail: string;
    contactPhone: string;
  };
  company: {
    organization: string;
  };
};

type Props = {
  referral: Referral;
  isBH?: boolean;
  fetchStatusHistory: (referralId: number) => Promise<StatusHistoryEntry[]>;
};

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value || <span className="italic text-muted-foreground/50">—</span>}</p>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <CardTitle className="text-base">{title}</CardTitle>
      </div>
    </div>
  );
}



// Top-of-page summary card: patient name, submitted by, and key at-a-glance fields
function ReferralSummaryCard({ referral }: { referral: Referral }) {
  const { t } = useTranslation();
  const { formatDate } = useLocalFormatDate();

  return (
    <Card>
      <CardHeader className="pb-3">
        <SectionHeader icon={User} title={t("referrals.summarySection")} />
        <CardDescription className="text-xs">{t("referrals.summaryHint")}</CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          <InfoRow label={t("common.fullName")} value={`${referral.patientFirstName} ${referral.patientLastName}`} />
          <InfoRow
            label={t("referrals.submittedByLabel")}
            value={`${referral.user.contactFirstName} ${referral.user.contactLastName}`}
          />
          <InfoRow label={t("common.gender")} value={referral.gender} />
          <InfoRow label={t("referrals.dateOfBirthLabel")} value={formatDate(referral.dob)} />
          <InfoRow label={t("referrals.referredByLabel")} value={referral.referName} />
          <InfoRow label={t("referrals.dateOfReferral")} value={formatDate(referral.dateOfReferral)} />
          <InfoRow label={t("common.organization")} value={referral.company.organization} />
        </div>
      </CardContent>
    </Card>
  );
}

// Status History Table (Status & Date in MM/DD/YYYY format)
function StatusHistoryTable({
  referralId,
  fetchStatusHistory,
  locale,
}: {
  referralId: number;
  fetchStatusHistory: (referralId: number) => Promise<StatusHistoryEntry[]>;
  locale: "en" | "es";
}) {
  const { t } = useTranslation();
  const { formatDate } = useLocalFormatDate();
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(false);

    fetchStatusHistory(referralId)
      .then((data) => {
        if (isMounted) setHistory(data || []);
      })
      .catch((err) => {
        console.error("Failed to load status history:", err);
        if (isMounted) setError(true);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [referralId, fetchStatusHistory]);

  const formatDateOnly = (dateVal: string | Date | undefined | null): string =>
    formatDate(dateVal) || "—";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4 text-xs text-muted-foreground gap-2">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-xs text-destructive py-2 text-center">Failed to load status history.</p>;
  }

  const statusUpdates = history.filter((e: any) => !e.changes || e.changes === "Status Updated" || !e.changes.includes("->"));
  const fieldEdits = history.filter((e: any) => e.changes && e.changes !== "Status Updated" && e.changes.includes("->"));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Status History Card */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader icon={Hash} title={t("referrals.statusReportSection")} />
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 pb-3">
          {statusUpdates.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-2 text-center">No status changes recorded yet.</p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-35 text-xs">{t("common.status")}</TableHead>
                    <TableHead className="text-xs">{t("common.date")}</TableHead>
                    <TableHead className="text-xs">Changed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statusUpdates.map((entry, index) => {
                    const e = entry as Record<string, any>;
                    const color = getStatusColor(entry.status);
                    const dateStr = e.createdAt || e.changedAt || e.timestamp || e.date;
                    return (
                      <TableRow key={entry.id ?? index}>
                        <TableCell className="py-2">
                          <Badge
                            variant="outline"
                            style={{
                              backgroundColor: color + "22",
                              color,
                              borderColor: color + "55",
                            }}
                            className="rounded-md capitalize text-xs px-2 py-0.5 whitespace-nowrap"
                          >
                            {getStatusLabel(entry.status, locale)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs whitespace-nowrap py-2">{formatDateOnly(dateStr)}</TableCell>
                        <TableCell className="text-xs py-2 whitespace-nowrap">{e.changedByName || "System"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit History Card */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader icon={Edit} title="Edit History" />
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 pb-3">
          {fieldEdits.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-2 text-center">No edits recorded yet.</p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">{t("common.date")}</TableHead>
                    <TableHead className="text-xs">Edited By</TableHead>
                    <TableHead className="text-xs">Changes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fieldEdits.map((entry, index) => {
                    const e = entry as Record<string, any>;
                    const dateStr = e.createdAt || e.changedAt || e.timestamp || e.date;
                    return (
                      <TableRow key={entry.id ?? index}>
                        <TableCell className="text-xs whitespace-nowrap py-2">{formatDateOnly(dateStr)}</TableCell>
                        <TableCell className="text-xs py-2 whitespace-nowrap">{e.changedByName || "System"}</TableCell>
                        <TableCell className="text-xs py-2 text-muted-foreground">{e.changes}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ViewTab({ referral }: { referral: Referral }) {
  const { t } = useTranslation();
  const { formatDate } = useLocalFormatDate();
  const serviceTypeLabel = SERVICE_TYPE_LABEL_KEYS[referral.serviceType as keyof typeof SERVICE_TYPE_LABEL_KEYS]
    ? t(SERVICE_TYPE_LABEL_KEYS[referral.serviceType as keyof typeof SERVICE_TYPE_LABEL_KEYS])
    : referral.serviceType;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Patient Details */}
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader icon={User} title={t("referrals.patientSection")} />
            <CardDescription className="text-xs">{t("referrals.personalDetails")}</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-3">
            <InfoRow label={t("referrals.dateOfBirthLabel")} value={formatDate(referral.dob)} />
            <InfoRow label={t("referrals.raceLabel")} value={referral.race} />
            <InfoRow label={t("referrals.ssnLabel")} value="••••••••••" />
          </CardContent>
        </Card>

        {/* Parent / Guardian */}
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader icon={User} title={t("referrals.parentGuardianSection")} />
            <CardDescription className="text-xs">{t("referrals.guardianContactInfo")}</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-3">
            <InfoRow label={t("common.firstName")} value={referral.parentFirstName} />
            <InfoRow label={t("common.lastName")} value={referral.parentLastName} />
            <InfoRow label={t("common.email")} value={referral.parentEmail} />
            <InfoRow label={t("common.phone")} value={referral.parentPhone} />
          </CardContent>
        </Card>

        {/* Submitted By */}
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader icon={UserCheck} title={t("referrals.submittedBySection")} />
            <CardDescription className="text-xs">{t("referrals.referringContact")}</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-3">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">{t("common.email")}</p>
              <a href={`mailto:${referral.user.contactEmail}`} className="text-sm text-primary hover:underline">
                {referral.user.contactEmail}
              </a>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">{t("common.phone")}</p>
              <a href={`tel:${referral.user.contactPhone}`} className="text-sm text-primary hover:underline">
                {referral.user.contactPhone}
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Referral Info */}
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader icon={ShieldCheck} title={t("referrals.referralInfoSection")} />
            <CardDescription className="text-xs">{t("referrals.typePriorityDates")}</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-3">
            <InfoRow label={t("common.serviceType")} value={serviceTypeLabel} />
            <InfoRow label={t("referrals.testType")} value={referral.type ?? ""} />
            <InfoRow label={t("common.priority")} value={getPriorityLabel(referral.priority ?? "", t)} />
            <InfoRow label={t("referrals.dateOfPatientContact")} value={formatDate(referral.datePatientContact)} />
            <InfoRow label={t("referrals.methodOfContactLabel")} value={referral.methodOfContact} />
          </CardContent>
        </Card>
      </div>

      {/* Attachments */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader icon={Paperclip} title={t("referrals.attachmentsSection")} />
          <CardDescription className="text-xs">
            {t(referral.clientAttachments.length === 1 ? "referrals.attachmentsCountOne" : "referrals.attachmentsCountOther", { n: referral.clientAttachments.length })}
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          {referral.clientAttachments.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">{t("referrals.noAttachments")}</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {referral.clientAttachments.map((stored, index) => {
                const { name, url } = parseAttachment(stored, index);
                return (
                  <li key={stored}>
                    <Button variant="outline" size="sm" asChild className="w-full justify-start gap-2 text-sm">
                      <Link href={url} target="_blank" rel="noopener noreferrer">
                        <Paperclip className="h-3.5 w-3.5 shrink-0" />
                        {name}
                      </Link>
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {referral.notes && (
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader icon={FileText} title={t("common.notes")} />
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <p className="text-sm text-foreground whitespace-pre-wrap">{referral.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ManageTab({
  referral,
  isBH,
  fetchStatusHistory,
}: {
  referral: Referral;
  isBH: boolean;
  fetchStatusHistory: (referralId: number) => Promise<StatusHistoryEntry[]>;
}) {
  const { t, locale } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Status Management */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader icon={Activity} title={t("referrals.statusManagementSection")} />
          <CardDescription className="text-xs">{t("referrals.updateStatusHint")}</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t("referrals.currentStatus")}
              </p>
              <Badge
                variant="outline"
                style={{
                  color: getStatusColor(referral.status),
                  borderColor: getStatusColor(referral.status) + "55",
                }}
                className="rounded-md capitalize text-sm px-3 py-1"
              >
                {getStatusLabel(referral.status, locale)}
              </Badge>
            </div>
            <div className="sm:min-w-70">
              <UpdateStatusForm referralId={referral.id} currentStatus={referral.status} isBH={isBH} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        {/* History Tables */}
        <StatusHistoryTable
          referralId={referral.id}
          fetchStatusHistory={fetchStatusHistory}
          locale={locale as "en" | "es"}
        />

        {/* Result Management */}
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader icon={FileOutput} title={t("referrals.resultReportSection")} />
            <CardDescription className="text-xs">{t("referrals.uploadResultHint")}</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <ResultUploader referralId={referral.id} currentResult={referral.pdfResult ?? null} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ReferralDetailTabs({ referral, isBH = false, fetchStatusHistory }: Props) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"view" | "manage" | "edit">("view");

  return (
    <div className="space-y-4">
      <ReferralSummaryCard referral={referral} />

      <div className="flex border-b border-border">
        <button
          onClick={() => setTab("view")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "view"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Eye className="h-4 w-4" />
          {t("common.view")}
        </button>
        <button
          onClick={() => setTab("manage")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "manage"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Settings className="h-4 w-4" />
          {t("common.manage")}
        </button>
        <button
          onClick={() => setTab("edit")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "edit"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Edit className="h-4 w-4" />
          {t("common.edit")}
        </button>

      </div>

      {tab === "view" && <ViewTab referral={referral} />}
      {tab === "manage" && <ManageTab referral={referral} isBH={isBH} fetchStatusHistory={fetchStatusHistory} />}
      {tab === "edit" && (
        <div className="flex justify-center py-4">
          <EditReferralForm referralId={referral.id} initialData={referral as any} onSuccess={() => setTab("view")} />
        </div>
      )}
    </div>
  );
}