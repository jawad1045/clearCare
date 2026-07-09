"use client";

import { useState } from "react";
import { Eye, Settings, User, Building2, Paperclip, UserCheck, Activity, FileOutput, Calendar, Hash, Phone, Mail, ShieldCheck, FileText } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UpdateStatusForm } from "@/components/referrals/status-selector";
import { ResultUploader } from "@/components/referrals/result-uploader";
import { parseAttachment } from "@/lib/parse-attachment";
import { getStatusColor, getStatusLabel } from "@/lib/referral-statuses";
import { SERVICE_TYPE_LABEL_KEYS, getPriorityLabel } from "@/lib/referral-filters";
import { useTranslation } from "@/locale/use-translation";

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
  grade: string;
  race: string;
  gender: string;
  ssn: string;
  type: string;
  priority: string;
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
  const formatDate = (d: Date | null) =>
    d ? new Date(d).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", { year: "numeric", month: "long", day: "numeric" }) : null;
  const serviceTypeLabel = SERVICE_TYPE_LABEL_KEYS[referral.serviceType as keyof typeof SERVICE_TYPE_LABEL_KEYS]
    ? t(SERVICE_TYPE_LABEL_KEYS[referral.serviceType as keyof typeof SERVICE_TYPE_LABEL_KEYS])
    : referral.serviceType;

  return (
    <div className="space-y-4">

      <div className="grid gap-4 sm:grid-cols-2">

        {/* Patient */}
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader icon={User} title={t("referrals.patientSection")} />
            <CardDescription className="text-xs">{t("referrals.personalDetails")}</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-3">
            <InfoRow label={t("common.fullName")} value={`${referral.patientFirstName} ${referral.patientLastName}`} />
            <InfoRow label={t("referrals.dateOfBirthLabel")} value={formatDate(referral.dob)} />
            <InfoRow label={t("common.gender")} value={referral.gender} />
            <InfoRow label={t("referrals.raceLabel")} value={referral.race} />
            <InfoRow label={t("referrals.gradeLabel")} value={referral.grade} />
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

        {/* Referral Info */}
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader icon={ShieldCheck} title={t("referrals.referralInfoSection")} />
            <CardDescription className="text-xs">{t("referrals.typePriorityDates")}</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-3">
            <InfoRow label={t("common.serviceType")} value={serviceTypeLabel} />
            <InfoRow label={t("referrals.testType")} value={referral.type} />
            <InfoRow label={t("common.priority")} value={getPriorityLabel(referral.priority, t)} />
            <InfoRow label={t("referrals.dateOfReferral")} value={formatDate(referral.dateOfReferral)} />
            <InfoRow label={t("referrals.dateOfPatientContact")} value={formatDate(referral.datePatientContact)} />
            <InfoRow label={t("referrals.methodOfContactLabel")} value={referral.methodOfContact} />
            <InfoRow label={t("referrals.referredByLabel")} value={referral.referName} />
          </CardContent>
        </Card>

        {/* Submitted By + Organization */}
        <div className="space-y-4">
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

function ManageTab({ referral, isBH }: { referral: Referral; isBH: boolean }) {
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
          <ResultUploader referralId={referral.id} currentResult={referral.pdfResult ?? null} />
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
              <UpdateStatusForm referralId={referral.id} currentStatus={referral.status} isBH={isBH} />
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

export function ReferralDetailTabs({ referral, isBH = false }: Props) {
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
        <ManageTab referral={referral} isBH={isBH} />
      )}
    </div>
  );
}
