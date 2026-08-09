"use client";

import { User, Building2, Paperclip, UserCheck, Activity, FileOutput, Hash, FileText, History } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UpdateStatusForm } from "@/components/referrals/status-selector";
import { BHResultUploader } from "@/components/referrals/bh-result-uploader";
import { parseAttachment } from "@/lib/parse-attachment";
import { getStatusColor, getStatusLabel } from "@/lib/referral-statuses";
import { useTranslation } from "@/locale/use-translation";

type StatusHistoryEntry = {
  status: string;
  changedAt: Date;
};

type MentalHealthReferral = {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  last4SSN: string;
  email: string | null;
  gender: string;
  dob?: Date | null;
  status: string;
  appointmentDate: Date | null;
  pdfReport: string | null;
  clientAttachments: string[];
  referName: string;
  dateOfReferral: Date;
  notes: string | null;
  lastUpdated: Date;
  statusHistory?: StatusHistoryEntry[];
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
  referral: MentalHealthReferral;
};

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

function formatDate(d?: Date | null) {
  if (!d) return "—";
  const date = new Date(d);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function ViewTab({ referral }: { referral: MentalHealthReferral }) {
  const { t, locale } = useTranslation();

  const statusHistory = referral.statusHistory ?? [];

  return (
    <div className="space-y-4">

      {/* Record summary row */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader icon={Hash} title={t("referrals.recordSection") ?? "Record"} />
          <CardDescription className="text-xs">{t("referrals.personalDetails")}</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 overflow-x-auto">
          <Table className="table-fixed w-full min-w-195">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-1/8 text-center whitespace-nowrap">{t("referrals.referralId")}</TableHead>
                <TableHead className="w-1/8 text-center whitespace-nowrap">{t("common.fullName")}</TableHead>
                <TableHead className="w-1/8 text-center whitespace-nowrap">{t("common.dob") ?? "DOB"}</TableHead>
                <TableHead className="w-1/8 text-center whitespace-nowrap">{t("common.gender")}</TableHead>
                <TableHead className="w-1/8 text-center whitespace-nowrap">{t("referrals.last4SsnLabel")}</TableHead>
                <TableHead className="w-1/8 text-center whitespace-nowrap">{t("referrals.appointmentDate")}</TableHead>
                <TableHead className="w-1/8 text-center whitespace-nowrap">{t("referrals.submittedBySection")}</TableHead>
                <TableHead className="w-1/8 text-center whitespace-nowrap">{t("referrals.resultReportSection")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-transparent">
                <TableCell className="text-center font-medium whitespace-nowrap">#{referral.id}</TableCell>
                <TableCell className="text-center whitespace-nowrap">{referral.firstName} {referral.lastName}</TableCell>
                <TableCell className="text-center whitespace-nowrap">{formatDate(referral.dob)}</TableCell>
                <TableCell className="text-center whitespace-nowrap">{referral.gender}</TableCell>
                <TableCell className="text-center whitespace-nowrap">••{referral.last4SSN}</TableCell>
                <TableCell className="text-center whitespace-nowrap">{formatDate(referral.appointmentDate)}</TableCell>
                <TableCell className="text-center whitespace-nowrap">
                  {referral.user.contactFirstName} {referral.user.contactLastName}
                </TableCell>
                <TableCell className="text-center whitespace-nowrap">
                  {referral.pdfReport ? (
                    <Button variant="outline" size="sm" asChild className="h-7 gap-1.5 text-xs">
                      <Link href={referral.pdfReport} target="_blank" rel="noopener noreferrer">
                        <FileOutput className="h-3.5 w-3.5" />
                        {t("common.download") ?? "Download"}
                      </Link>
                    </Button>
                  ) : (
                    <span className="italic text-muted-foreground/50">—</span>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">

        {/* Status History */}
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader icon={History} title={t("referrals.statusHistorySection") ?? "Status History"} />
            <CardDescription className="text-xs">{t("referrals.statusHistoryHint") ?? "Full record of status changes"}</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            {statusHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">{t("referrals.noStatusHistory") ?? "No status changes recorded yet."}</p>
            ) : (
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-1/2 text-center">{t("common.status")}</TableHead>
                    <TableHead className="w-1/2 text-center">{t("common.date") ?? "Date"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statusHistory.map((entry, index) => (
                    <TableRow key={`${entry.status}-${index}`} className="hover:bg-transparent">
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          style={{
                            color: getStatusColor(entry.status),
                            borderColor: getStatusColor(entry.status) + "55",
                          }}
                          className="rounded-md capitalize"
                        >
                          {getStatusLabel(entry.status, locale)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">{formatDate(entry.changedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

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
              <Table>
                <TableBody>
                  {referral.clientAttachments.map((stored, index) => {
                    const { name, url } = parseAttachment(stored, index);
                    return (
                      <TableRow key={stored} className="hover:bg-transparent">
                        <TableCell className="py-2.5 text-sm">
                          <Link
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary hover:underline"
                          >
                            <Paperclip className="h-3.5 w-3.5 shrink-0" />
                            {name}
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader icon={Activity} title={t("referrals.statusManagementSection")} />
            <CardDescription className="text-xs">{t("referrals.updateStatusHint")}</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <div className="grid gap-6 sm:grid-cols-2 sm:items-center">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("referrals.currentStatus")}
                </p>
                <Badge
                  variant="outline"
                  style={{
                    color: getStatusColor(referral.status),
                    borderColor: getStatusColor(referral.status) + "55",
                  }}
                  className="rounded-md px-3 py-1 text-sm capitalize"
                >
                  {getStatusLabel(referral.status, locale)}
                </Badge>
              </div>
              <div className="w-full pt-4">
                <UpdateStatusForm referralId={referral.id} currentStatus={referral.status} isBH />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Result PDF */}
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader icon={FileOutput} title={t("referrals.resultReportSection")} />
            <CardDescription className="text-xs">{t("referrals.uploadResultHint")}</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pb-8">
            <BHResultUploader referralId={referral.id} currentResult={referral.pdfReport ?? null} />
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

export function MentalHealthReferralDetailTabs({ referral }: Props) {
  return (
    <div className="space-y-4">
      <ViewTab referral={referral} />
    </div>
  );
}