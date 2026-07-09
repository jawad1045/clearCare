import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getReferralById } from "@/action/referral.action";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  User,
  Building2,
  Paperclip,
  UserCheck,
  Activity,
  FileOutput,
  Download,
  ShieldCheck,
  FileText,
  Hash,
} from "lucide-react";
import { appConfig } from "@/next.config";
import { parseAttachment } from "@/lib/parse-attachment";
import { getStatusColor, getStatusDescription, getStatusLabel } from "@/lib/referral-statuses";
import { SERVICE_TYPE_LABEL_KEYS, getPriorityLabel } from "@/lib/referral-filters";
import { getServerTranslation } from "@/locale/server";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Referral Details",
};

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground shrink-0">{label}</dt>
      <dd className="font-medium text-right">
        {value ?? <span className="italic text-muted-foreground/50">—</span>}
      </dd>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <CardHeader className="pb-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && (
            <CardDescription className="text-xs">{description}</CardDescription>
          )}
        </div>
      </div>
    </CardHeader>
  );
}

export default async function UserReferralDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const referral = await getReferralById(Number(id));

  if (!referral) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  if (currentUser?.role !== "Admin" && referral.userId !== currentUser?.id) {
    redirect("/user");
  }

  const { t, locale } = await getServerTranslation();

  const formatDate = (d: Date | null) =>
    d
      ? new Date(d).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

  const serviceTypeLabel = SERVICE_TYPE_LABEL_KEYS[referral.serviceType as keyof typeof SERVICE_TYPE_LABEL_KEYS]
    ? t(SERVICE_TYPE_LABEL_KEYS[referral.serviceType as keyof typeof SERVICE_TYPE_LABEL_KEYS])
    : referral.serviceType;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <div className="mb-6">
            {/* <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              {appConfig.name}
            </p>
            <p className="text-xs text-muted-foreground">{appConfig.slogan}</p> */}
          </div>

          <Button
            variant="ghost"
            size="sm"
            asChild
            className="mb-4 -ml-2 text-muted-foreground rounded-md"
          >
            <Link href="/user/referrals">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              {t("referrals.backToReferrals")}
            </Link>
          </Button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {t("referrals.referralHeading")}{" "}
                <span className="text-muted-foreground font-normal">
                  #{referral.id}
                </span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {referral.patientFirstName} {referral.patientLastName} &mdash;
                {" "}{t("referrals.submittedByPrefix")} {referral.user.contactFirstName}{" "}
                {referral.user.contactLastName}
              </p>
            </div>
            <Badge
              variant="secondary"
              style={{
                color: getStatusColor(referral.status),
                borderColor:
                  (getStatusColor(referral.status)) + "55",
              }}
              className="mt-1 p-1 bg-background border-0 shrink-0  capitalize"
            >
              {t("referrals.currentStatusPrefix")} {getStatusLabel(referral.status, locale)}
            </Badge>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">

          {/* Patient Information */}
          <Card>
            <SectionHeader icon={User} title={t("referrals.patientSection")} description={t("referrals.personalDetails")} />
            <Separator />
            <CardContent className="pt-4">
              <dl className="space-y-3 text-sm">
                <InfoRow
                  label={t("common.fullName")}
                  value={`${referral.patientFirstName} ${referral.patientLastName}`}
                />
                <InfoRow label={t("referrals.dateOfBirthLabel")} value={formatDate(referral.dob)} />
                <InfoRow label={t("common.gender")} value={referral.gender?.toLowerCase()} />
                <InfoRow label={t("referrals.raceLabel")} value={referral.race} />
                <InfoRow label={t("referrals.gradeLabel")} value={referral.grade} />
                <InfoRow label={t("referrals.ssnLabel")} value="••••••••••" />
              </dl>
            </CardContent>
          </Card>

          {/* Parent / Guardian */}
          <Card>
            <SectionHeader
              icon={User}
              title={t("referrals.parentGuardianSection")}
              description={t("referrals.guardianContactInfo")}
            />
            <Separator />
            <CardContent className="pt-4">
              <dl className="space-y-3 text-sm">
                <InfoRow label={t("common.firstName")} value={referral.parentFirstName} />
                <InfoRow label={t("common.lastName")} value={referral.parentLastName} />
                <InfoRow label={t("common.email")} value={referral.parentEmail} />
                <InfoRow label={t("common.phone")} value={referral.parentPhone} />
              </dl>
            </CardContent>
          </Card>

          {/* Referral Info */}
          <Card>
            <SectionHeader
              icon={ShieldCheck}
              title={t("referrals.referralInfoSection")}
              description={t("referrals.typePriorityDates")}
            />
            <Separator />
            <CardContent className="pt-4">
              <dl className="space-y-3 text-sm">
                <InfoRow label={t("common.serviceType")} value={serviceTypeLabel} />
                <InfoRow label={t("referrals.testType")} value={referral.type} />
                <InfoRow label={t("common.priority")} value={getPriorityLabel(referral.priority, t)} />
                <InfoRow
                  label={t("referrals.dateOfReferral")}
                  value={formatDate(referral.dateOfReferral)}
                />
                <InfoRow
                  label={t("referrals.dateOfPatientContact")}
                  value={formatDate(referral.datePatientContact)}
                />
                <InfoRow label={t("referrals.methodOfContactLabel")} value={referral.methodOfContact} />
                <InfoRow label={t("referrals.referredByLabel")} value={referral.referName} />
              </dl>
            </CardContent>
          </Card>

          {/* Submitted By */}
          <Card>
            <SectionHeader
              icon={UserCheck}
              title={t("referrals.submittedBySection")}
              description={t("referrals.referringContact")}
            />
            <Separator />
            <CardContent className="pt-4">
              <dl className="space-y-3 text-sm">
                <InfoRow
                  label={t("common.name")}
                  value={`${referral.user.contactFirstName} ${referral.user.contactLastName}`}
                />
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground shrink-0">{t("common.email")}</dt>
                  <dd className="font-medium text-right">
                    <a
                      href={`mailto:${referral.user.contactEmail}`}
                      className="hover:underline text-primary truncate"
                    >
                      {referral.user.contactEmail}
                    </a>
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground shrink-0">{t("common.phone")}</dt>
                  <dd className="font-medium text-right">
                    <a
                      href={`tel:${referral.user.contactPhone}`}
                      className="hover:underline text-primary"
                    >
                      {referral.user.contactPhone}
                    </a>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Organization */}
          <Card>
            <SectionHeader
              icon={Building2}
              title={t("referrals.organizationSection")}
              description={t("referrals.associatedCompany")}
            />
            <Separator />
            <CardContent className="pt-4">
              <dl className="text-sm">
                <InfoRow label={t("common.organization")} value={referral.company.organization} />
              </dl>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <SectionHeader
              icon={Paperclip}
              title={t("referrals.attachmentsSection")}
              description={t(referral.clientAttachments.length === 1 ? "referrals.attachmentsCountOne" : "referrals.attachmentsCountOther", { n: referral.clientAttachments.length })}
            />
            <Separator />
            <CardContent className="pt-4">
              {referral.clientAttachments.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  {t("referrals.noAttachments")}
                </p>
              ) : (
                <ul className="space-y-2">
                  {referral.clientAttachments.map((stored, index) => {
                    const { name, url } = parseAttachment(stored, index);
                    return (
                      <li key={stored}>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="w-full justify-start gap-2 text-sm"
                        >
                          <Link
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
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

        </div>

        {/* Notes */}
        {referral.notes && (
          <Card className="mt-4">
            <SectionHeader icon={FileText} title={t("common.notes")} />
            <Separator />
            <CardContent className="pt-4">
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {referral.notes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Result PDF — download only */}
        <Card className="mt-4">
          <SectionHeader
            icon={FileOutput}
            title={t("referrals.resultReportSection")}
            description={t("referrals.resultDocumentHint")}
          />
          <Separator />
          <CardContent className="pt-4">
            {referral.pdfResult ? (
              <Button variant="outline" size="sm" asChild className="gap-2">
                <Link
                  href={referral.pdfResult}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  <Download className="h-4 w-4" />
                  {t("referrals.downloadResultPdf")}
                </Link>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                {t("referrals.noResultAvailable")}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Record Info */}
        <Card className="mt-4">
          <SectionHeader icon={Hash} title={t("common.recordInfo")} />
          <Separator />
          <CardContent className="pt-4">
            <dl className="grid gap-3 sm:grid-cols-2 text-sm">
              <InfoRow label={t("referrals.referralId")} value={String(referral.id)} />
              <InfoRow
                label={t("common.lastUpdated")}
                value={formatDate(referral.lastUpdated)}
              />
            </dl>
          </CardContent>
        </Card>

        {/* Status — read-only */}
        <Card className="mt-4">
          <SectionHeader
            icon={Activity}
            title={t("referrals.referralStatusSection")}
            description={t("referrals.currentStateHint")}
          />
          <Separator />
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <Badge
                variant="outline"
                style={{
                  backgroundColor:
                    (getStatusColor(referral.status)) + "22",
                  color: getStatusColor(referral.status),
                  borderColor:
                    (getStatusColor(referral.status)) + "55",
                }}
                className="capitalize text-sm px-3 py-1"
              >
                {getStatusLabel(referral.status, locale)}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {getStatusDescription(referral.status, locale) || t("referrals.statusBeingProcessed")}
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
