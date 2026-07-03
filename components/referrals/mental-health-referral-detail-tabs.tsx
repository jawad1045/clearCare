"use client";

import { useState } from "react";
import { Eye, Settings, User, Building2, Paperclip, UserCheck, Activity, FileOutput, Calendar, Hash, FileText } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UpdateStatusForm } from "@/components/referrals/status-selector";
import { BHResultUploader } from "@/components/referrals/bh-result-uploader";
import { parseAttachment } from "@/lib/parse-attachment";
import { getStatusColor, getStatusLabel } from "@/lib/referral-statuses";
import { useTranslation } from "@/locale/use-translation";

type MentalHealthReferral = {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  last4SSN: string;
  email: string | null;
  gender: string;
  status: string;
  appointmentDate: Date | null;
  pdfReport: string | null;
  clientAttachments: string[];
  referName: string;
  dateOfReferral: Date;
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
  referral: MentalHealthReferral;
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

function ViewTab({ referral }: { referral: MentalHealthReferral }) {
  const { t, locale } = useTranslation();
  const formatDate = (d: Date | null) =>
    d ? new Date(d).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", { year: "numeric", month: "long", day: "numeric" }) : null;

  return (
    <div className="space-y-4">

      <div className="grid gap-4 sm:grid-cols-2">

        {/* Client */}
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader icon={User} title={t("common.client")} />
            <CardDescription className="text-xs">{t("referrals.personalDetails")}</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-3">
            <InfoRow label={t("common.fullName")} value={`${referral.firstName} ${referral.lastName}`} />
            <InfoRow label={t("common.phone")} value={referral.phone} />
            <InfoRow label={t("common.email")} value={referral.email} />
            <InfoRow label={t("common.gender")} value={referral.gender} />
            <InfoRow label={t("referrals.last4SsnLabel")} value={`••${referral.last4SSN}`} />
          </CardContent>
        </Card>

        {/* Referral Info */}
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader icon={Calendar} title={t("referrals.referralInfoSection")} />
            <CardDescription className="text-xs">{t("referrals.datesReferrer")}</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-3">
            <InfoRow label={t("referrals.dateOfReferral")} value={formatDate(referral.dateOfReferral)} />
            <InfoRow label={t("referrals.appointmentDate")} value={formatDate(referral.appointmentDate)} />
            <InfoRow label={t("referrals.referredByLabel")} value={referral.referName} />
          </CardContent>
        </Card>

        {/* Submitted By, Organization, Attachments, Record Info */}
        <div className="grid gap-4 sm:grid-cols-2 sm:col-span-2">

          {/* Submitted By */}
          <Card>
            <CardHeader className="pb-3">
              <SectionHeader icon={UserCheck} title={t("referrals.submittedBySection")} />
              <CardDescription className="text-xs">{t("referrals.referringContact")}</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4 space-y-3">
              <InfoRow label={t("common.name")} value={`${referral.user.contactFirstName} ${referral.user.contactLastName}`} />
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

          {/* Organization */}
          <Card>
            <CardHeader className="pb-3">
              <SectionHeader icon={Building2} title={t("referrals.organizationSection")} />
              <CardDescription className="text-xs">{t("referrals.associatedCompany")}</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <InfoRow label={t("common.organization")} value={referral.company.organization} />
            </CardContent>
          </Card>

          {/* Record Info */}
          <Card>
            <CardHeader className="pb-3">
              <SectionHeader icon={Hash} title={t("common.recordInfo")} />
            </CardHeader>
            <Separator />
            <CardContent className="pt-4 grid gap-3 sm:grid-cols-2">
              <InfoRow label={t("referrals.referralId")} value={String(referral.id)} />
              <InfoRow label={t("common.status")} value={getStatusLabel(referral.status, locale)} />
              <InfoRow label={t("common.lastUpdated")} value={formatDate(referral.lastUpdated)} />
            </CardContent>
          </Card>

        </div>

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

function ManageTab({ referral }: { referral: MentalHealthReferral }) {
  const { t, locale } = useTranslation();

  return (
    <div className="space-y-4">

      {/* Result PDF */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader icon={FileOutput} title={t("referrals.resultReportSection")} />
          <CardDescription className="text-xs">{t("referrals.uploadResultHint")}</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <BHResultUploader referralId={referral.id} currentResult={referral.pdfReport ?? null} />
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
              <UpdateStatusForm referralId={referral.id} currentStatus={referral.status} isBH />
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

export function MentalHealthReferralDetailTabs({ referral }: Props) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"view" | "manage">("view");

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
      </div>

      {tab === "view" ? (
        <ViewTab referral={referral} />
      ) : (
        <ManageTab referral={referral} />
      )}
    </div>
  );
}
