import { notFound } from "next/navigation";
import { getReferralById } from "@/action/referral.action";
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
import { STATUS_COLORS, STATUS_DESCRIPTIONS } from "@/lib/referral-statuses";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
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

  const formatDate = (d: Date | null) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              {appConfig.name}
            </p>
            <p className="text-xs text-muted-foreground">{appConfig.slogan}</p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            asChild
            className="mb-4 -ml-2 text-muted-foreground"
          >
            <Link href="/user/referrals">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to Referrals
            </Link>
          </Button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Referral{" "}
                <span className="text-muted-foreground font-normal">
                  #{referral.id}
                </span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {referral.patientFirstName} {referral.patientLastName} &mdash;
                submitted by {referral.user.contactFirstName}{" "}
                {referral.user.contactLastName}
              </p>
            </div>
            <Badge
              variant="outline"
              style={{
                backgroundColor:
                  (STATUS_COLORS[referral.status] ?? "#6b7280") + "22",
                color: STATUS_COLORS[referral.status] ?? "#6b7280",
                borderColor:
                  (STATUS_COLORS[referral.status] ?? "#6b7280") + "55",
              }}
              className="mt-1 shrink-0 capitalize"
            >
              {referral.status.toLowerCase()}
            </Badge>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">

          {/* Patient Information */}
          <Card>
            <SectionHeader icon={User} title="Patient" description="Personal details" />
            <Separator />
            <CardContent className="pt-4">
              <dl className="space-y-3 text-sm">
                <InfoRow
                  label="Full Name"
                  value={`${referral.patientFirstName} ${referral.patientLastName}`}
                />
                <InfoRow label="Date of Birth" value={formatDate(referral.dob)} />
                <InfoRow label="Gender" value={referral.gender?.toLowerCase()} />
                <InfoRow label="Race" value={referral.race} />
                <InfoRow label="Grade" value={referral.grade} />
                <InfoRow label="SSN" value="••••••••••" />
              </dl>
            </CardContent>
          </Card>

          {/* Parent / Guardian */}
          <Card>
            <SectionHeader
              icon={User}
              title="Parent / Guardian"
              description="Guardian contact info"
            />
            <Separator />
            <CardContent className="pt-4">
              <dl className="space-y-3 text-sm">
                <InfoRow label="First Name" value={referral.parentFirstName} />
                <InfoRow label="Last Name" value={referral.parentLastName} />
                <InfoRow label="Email" value={referral.parentEmail} />
                <InfoRow label="Phone" value={referral.parentPhone} />
              </dl>
            </CardContent>
          </Card>

          {/* Referral Info */}
          <Card>
            <SectionHeader
              icon={ShieldCheck}
              title="Referral Info"
              description="Type, priority & dates"
            />
            <Separator />
            <CardContent className="pt-4">
              <dl className="space-y-3 text-sm">
                <InfoRow label="Service Type" value={referral.serviceType} />
                <InfoRow label="Type" value={referral.type} />
                <InfoRow label="Priority" value={referral.priority} />
                <InfoRow
                  label="Date of Referral"
                  value={formatDate(referral.dateOfReferral)}
                />
                <InfoRow
                  label="Date Patient Contacted"
                  value={formatDate(referral.datePatientContact)}
                />
                <InfoRow label="Method of Contact" value={referral.methodOfContact} />
                <InfoRow label="Referred By" value={referral.referName} />
              </dl>
            </CardContent>
          </Card>

          {/* Submitted By */}
          <Card>
            <SectionHeader
              icon={UserCheck}
              title="Submitted By"
              description="Referring contact"
            />
            <Separator />
            <CardContent className="pt-4">
              <dl className="space-y-3 text-sm">
                <InfoRow
                  label="Name"
                  value={`${referral.user.contactFirstName} ${referral.user.contactLastName}`}
                />
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground shrink-0">Email</dt>
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
                  <dt className="text-muted-foreground shrink-0">Phone</dt>
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
              title="Organization"
              description="Associated company"
            />
            <Separator />
            <CardContent className="pt-4">
              <dl className="text-sm">
                <InfoRow label="Organization" value={referral.company.organization} />
              </dl>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <SectionHeader
              icon={Paperclip}
              title="Attachments"
              description={`${referral.clientAttachments.length} file${referral.clientAttachments.length !== 1 ? "s" : ""} attached`}
            />
            <Separator />
            <CardContent className="pt-4">
              {referral.clientAttachments.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No attachments
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
            <SectionHeader icon={FileText} title="Notes" />
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
            title="Result / Report"
            description="Your referral result document"
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
                  Download Result PDF
                </Link>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No result available yet. Check back after your referral is
                processed.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Record Info */}
        <Card className="mt-4">
          <SectionHeader icon={Hash} title="Record Info" />
          <Separator />
          <CardContent className="pt-4">
            <dl className="grid gap-3 sm:grid-cols-2 text-sm">
              <InfoRow label="Referral ID" value={String(referral.id)} />
              <InfoRow
                label="Last Updated"
                value={formatDate(referral.lastUpdated)}
              />
            </dl>
          </CardContent>
        </Card>

        {/* Status — read-only */}
        <Card className="mt-4">
          <SectionHeader
            icon={Activity}
            title="Referral Status"
            description="Current state of your referral"
          />
          <Separator />
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <Badge
                variant="outline"
                style={{
                  backgroundColor:
                    (STATUS_COLORS[referral.status] ?? "#6b7280") + "22",
                  color: STATUS_COLORS[referral.status] ?? "#6b7280",
                  borderColor:
                    (STATUS_COLORS[referral.status] ?? "#6b7280") + "55",
                }}
                className="capitalize text-sm px-3 py-1"
              >
                {referral.status.toLowerCase()}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {STATUS_DESCRIPTIONS[referral.status] ??
                  "Status is being processed."}
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
