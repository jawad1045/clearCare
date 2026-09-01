"use client";

import { useState } from "react";
import { Eye, Edit, User, Paperclip, UserCheck, ShieldCheck, FileText, Download, Activity } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { parseAttachment } from "@/lib/parse-attachment";
import { getStatusColor, getStatusLabel } from "@/lib/referral-statuses";
import { SERVICE_TYPE_LABEL_KEYS, getPriorityLabel } from "@/lib/referral-filters";
import { decryptString } from "@/lib/encryption";
import { useTranslation } from "@/locale/use-translation";
import { useLocalFormatDate } from "@/hooks/use-local-format-date";
import { UserEditReferralForm } from "./user-edit-referral-form";
import { NotesTab } from "./notes-tab";

type Referral = {
  id: number;
  serviceType: string;
  parentFirstName: string | null;
  parentLastName: string | null;
  parentEmail: string | null;
  parentPhone: string | null;
  patientFirstName: string;
  patientLastName: string;
  patientId: string | null;
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
  statusHistory?: any[];
};

type Props = {
  referral: Referral;
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

function ViewTab({ referral }: { referral: Referral }) {
  const { t, locale } = useTranslation();
  const { formatDate } = useLocalFormatDate();
  const serviceTypeLabel = SERVICE_TYPE_LABEL_KEYS[referral.serviceType as keyof typeof SERVICE_TYPE_LABEL_KEYS]
    ? t(SERVICE_TYPE_LABEL_KEYS[referral.serviceType as keyof typeof SERVICE_TYPE_LABEL_KEYS])
    : referral.serviceType;

  const rawHistory = referral.statusHistory ?? [];
  const statusHistory =
    rawHistory.length > 0
      ? rawHistory.map((entry: any) => ({
          ...entry,
          status: entry.status,
          date: entry.createdAt ?? entry.changedAt ?? entry.date ?? referral.dateOfReferral ?? null,
          changedByName: entry.changedByName || "System",
          changes: entry.changes || "Status Updated",
        }))
      : [
          {
            status: referral.status,
            date: referral.dateOfReferral ?? null,
            changedByName: "System",
            changes: "Status Updated",
          },
        ];

  const statusUpdates = statusHistory.filter((e: any) => !e.changes || e.changes === "Status Updated" || !e.changes.includes("->"));
  const fieldEdits = statusHistory.filter((e: any) => e.changes && e.changes !== "Status Updated" && e.changes.includes("->"));

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader icon={User} title={t("referrals.summarySection")} />
          <CardDescription className="text-xs">{t("referrals.summaryHint")}</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            <InfoRow label={t("common.fullName")} value={`${referral.patientFirstName} ${referral.patientLastName}`} />
            <InfoRow label="Patient ID" value={referral.patientId} />
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
            <InfoRow label={t("referrals.ssnLabel")} value={referral.ssn ? `••••-••-${decryptString(referral.ssn).slice(-4)}` : "—"} />
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

        {/* Result */}
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader icon={Download} title={t("referrals.resultReportSection")} />
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            {referral.pdfResult ? (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-2"
              >
                <Link
                  href={referral.pdfResult}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  <Download className="h-3.5 w-3.5" />
                  {t("referrals.downloadResultPdf")}
                </Link>
              </Button>
            ) : (
              <span className="text-xs italic text-muted-foreground">
                {t("referrals.noResultAvailable")}
              </span>
            )}
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
              <ul className="space-y-2">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status History */}
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader icon={Activity} title={t("referrals.referralStatusSection")} />
            <CardDescription className="text-xs">{t("referrals.currentStateHint")}</CardDescription>
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
                    {statusUpdates.map((entry: any, index: number) => {
                      const entryColor = getStatusColor(entry.status);
                      return (
                        <TableRow key={index}>
                          <TableCell className="py-2">
                            <Badge
                              variant="outline"
                              style={{
                                backgroundColor: `${entryColor}22`,
                                color: entryColor,
                                borderColor: `${entryColor}55`,
                              }}
                              className="rounded-md capitalize text-xs px-2 py-0.5 whitespace-nowrap"
                            >
                              {getStatusLabel(entry.status, locale)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap py-2">{formatDate(entry.date)}</TableCell>
                          <TableCell className="text-xs py-2 whitespace-nowrap">{entry.changedByName || "System"}</TableCell>
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
            <CardDescription className="text-xs">Audit log of field edits</CardDescription>
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
                    {fieldEdits.map((entry: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="text-xs whitespace-nowrap py-2">{formatDate(entry.date)}</TableCell>
                        <TableCell className="text-xs py-2 whitespace-nowrap">{entry.changedByName || "System"}</TableCell>
                        <TableCell className="text-xs py-2 text-muted-foreground">{entry.changes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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

export function UserReferralDetailTabs({ referral }: Props) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"view" | "edit" | "notes">("view");

  const canEdit = referral.status?.trim().toLowerCase() === "pending";

  return (
    <div className="space-y-4">
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
        {canEdit && (
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
        )}
        <button
          onClick={() => setTab("notes")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "notes"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="h-4 w-4" />
          Admin Notes
        </button>
      </div>

      {tab === "view" && <ViewTab referral={referral} />}
      {tab === "edit" && canEdit && (
        <div className="flex justify-center py-4">
          <UserEditReferralForm referralId={referral.id} initialData={referral} onSuccess={() => setTab("view")} />
        </div>
      )}
      {tab === "notes" && <NotesTab referralId={referral.id} currentStatus={referral.status} isBH={false} isAdmin={false} />}
    </div>
  );
}
