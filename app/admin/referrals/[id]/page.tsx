import { notFound } from "next/navigation";
import { getReferralById } from "@/action/referral.action";
import { UpdateStatusForm } from "@/components/referrals/status-selector";
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
} from "lucide-react";
import { appConfig } from "@/next.config";
import { ResultUploader } from "@/components/referrals/result-uploader";
import { parseAttachment } from "@/lib/parse-attachment";
import { STATUS_COLORS } from "@/lib/referral-statuses";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ReferralDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const referral = await getReferralById(Number(id));

  if (!referral) {
    notFound();
  }

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

          <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 text-muted-foreground">
            <Link href="/admin/referrals">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to Referrals
            </Link>
          </Button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Referral <span className="text-muted-foreground font-normal">#{referral.id}</span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {referral.patientFirstName} {referral.patientLastName} &mdash; submitted by{" "}
                {referral.user.contactFirstName} {referral.user.contactLastName}
              </p>
            </div>
            <Badge
              variant="outline" style={{ backgroundColor: (STATUS_COLORS[referral.status] ?? "#6b7280") + "22", color: STATUS_COLORS[referral.status] ?? "#6b7280", borderColor: (STATUS_COLORS[referral.status] ?? "#6b7280") + "55" }}
              className="mt-1 shrink-0 capitalize"
            >
              {referral.status.toLowerCase()}
            </Badge>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">

          {/* Patient Information */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Patient</CardTitle>
                  <CardDescription className="text-xs">Personal details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Full Name</dt>
                  <dd className="font-medium">
                    {referral.patientFirstName} {referral.patientLastName}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Gender</dt>
                  <dd className="font-medium capitalize">{referral.gender?.toLowerCase() ?? "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Race</dt>
                  <dd className="font-medium">{referral.race ?? "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Grade</dt>
                  <dd className="font-medium">{referral.grade ?? "—"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Submitted By */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <UserCheck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Submitted By</CardTitle>
                  <CardDescription className="text-xs">Referring contact</CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="font-medium">
                    {referral.user.contactFirstName} {referral.user.contactLastName}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="font-medium truncate max-w-45">
                    <a
                      href={`mailto:${referral.user.contactEmail}`}
                      className="hover:underline text-primary"
                    >
                      {referral.user.contactEmail}
                    </a>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="font-medium">
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

          {/* Company */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Organization</CardTitle>
                  <CardDescription className="text-xs">Associated company</CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <p className="text-sm font-medium">{referral.company.organization}</p>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <Paperclip className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Attachments</CardTitle>
                  <CardDescription className="text-xs">
                    {referral.clientAttachments.length} file
                    {referral.clientAttachments.length !== 1 ? "s" : ""} attached
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              {referral.clientAttachments.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No attachments</p>
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

        </div>

        {/* Result PDF — admin upload */}
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <FileOutput className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Result / Report</CardTitle>
                <CardDescription className="text-xs">Upload the lab or test result PDF for this referral</CardDescription>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <ResultUploader referralId={referral.id} currentResult={referral.pdfResult ?? null} />
          </CardContent>
        </Card>

        {/* Status Management — full width */}
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Status Management</CardTitle>
                <CardDescription className="text-xs">Update the referral workflow status</CardDescription>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Current Status
                </p>
                <Badge
                  variant="outline" style={{ backgroundColor: (STATUS_COLORS[referral.status] ?? "#6b7280") + "22", color: STATUS_COLORS[referral.status] ?? "#6b7280", borderColor: (STATUS_COLORS[referral.status] ?? "#6b7280") + "55" }}
                  className="capitalize text-sm px-3 py-1"
                >
                  {referral.status.toLowerCase()}
                </Badge>
              </div>
              <div className="sm:min-w-70">
                <UpdateStatusForm
                  referralId={referral.id}
                  currentStatus={referral.status}
                />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}