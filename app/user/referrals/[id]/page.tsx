import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  Download,
  FileText,
  Paperclip,
} from "lucide-react";

import { getReferralById } from "@/action/referral.action";
import { getCurrentUser } from "@/lib/auth";
import { parseAttachment } from "@/lib/parse-attachment";
import { getStatusColor, getStatusLabel } from "@/lib/referral-statuses";
import { getServerTranslation } from "@/locale/server";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Referral Details",
};

export default async function UserReferralDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const referral = await getReferralById(Number(id));

  if (!referral) {
    notFound();
  }

  const currentUser = await getCurrentUser();

  // Security check: restrict non-admins to their own records
  if (!currentUser || (currentUser.role !== "Admin" && referral.userId !== currentUser.id)) {
    redirect("/user");
  }

  const { t, locale } = await getServerTranslation();

  // Strict MM/DD/YYYY formatting
  const formatDate = (d: Date | string | null) => {
    if (!d) return "—";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const rawHistory = referral.statusHistory ?? [];
  const statusHistory =
    rawHistory.length > 0
      ? rawHistory.map((entry) => ({
          status: entry.status,
          date: (entry as Record<string, unknown>).createdAt ?? (entry as Record<string, unknown>).date ?? referral.dateOfReferral ?? null,
        }))
      : [
          {
            status: referral.status,
            date: referral.dateOfReferral ?? null,
          },
        ];

  const currentStatusColor = getStatusColor(referral.status);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header Navigation & Summary */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="-ml-2 mb-4 rounded-md text-muted-foreground"
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
                <span className="font-normal text-muted-foreground">
                  #{referral.id}
                </span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {referral.patientFirstName} {referral.patientLastName} &mdash;{" "}
                {t("referrals.submittedByPrefix")}{" "}
                {referral.user?.contactFirstName ?? "—"}{" "}
                {referral.user?.contactLastName ?? ""}
              </p>
            </div>

            <Badge
              variant="secondary"
              style={{
                color: currentStatusColor,
                borderColor: `${currentStatusColor}55`,
              }}
              className="mt-1 shrink-0 border-0 bg-background p-1 capitalize"
            >
              {t("referrals.currentStatusPrefix")}{" "}
              {getStatusLabel(referral.status, locale)}
            </Badge>
          </div>
        </div>

        {/* Personal Details & Summary Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {t("referrals.referralHeading")}
            </CardTitle>
            <CardDescription className="text-xs">
              {t("referrals.personalDetails")}
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="overflow-x-auto pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("referrals.referralId")}</TableHead>
                  <TableHead>{t("common.fullName")}</TableHead>
                  <TableHead>{t("referrals.dateOfBirthLabel")}</TableHead>
                  <TableHead>{t("common.gender")}</TableHead>
                  <TableHead>{t("referrals.ssnLabel")}</TableHead>
                  <TableHead>{t("referrals.appointmentDate")}</TableHead>
                  <TableHead>{t("referrals.submittedBySection")}</TableHead>
                  <TableHead>{t("referrals.resultReportSection")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">{referral.id}</TableCell>
                  <TableCell>
                    {referral.patientFirstName} {referral.patientLastName}
                  </TableCell>
                  <TableCell>{formatDate(referral.dob)}</TableCell>
                  <TableCell className="capitalize">
                    {referral.gender?.toLowerCase() ?? "—"}
                  </TableCell>
                  <TableCell>••••••••••</TableCell>
                  <TableCell>{formatDate(referral.datePatientContact)}</TableCell>
                  <TableCell>
                    {referral.user?.contactFirstName ?? "—"}{" "}
                    {referral.user?.contactLastName ?? ""}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Notes Card */}
        {referral.notes && (
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-base">{t("common.notes")}</CardTitle>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <p className="whitespace-pre-wrap text-sm text-foreground">
                {referral.notes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Side-By-Side Attachments & Status History */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Attachments Card */}
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <Paperclip className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    {t("referrals.attachmentsSection")}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {t(
                      referral.clientAttachments?.length === 1
                        ? "referrals.attachmentsCountOne"
                        : "referrals.attachmentsCountOther",
                      { n: referral.clientAttachments?.length ?? 0 }
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              {!referral.clientAttachments?.length ? (
                <p className="text-sm italic text-muted-foreground">
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

          {/* Status Iteration History Table */}
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    {t("referrals.referralStatusSection")}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {t("referrals.currentStateHint")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead>{t("common.date")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statusHistory.map((entry, index) => {
                    const entryColor = getStatusColor(entry.status);
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge
                            variant="outline"
                            style={{
                              backgroundColor: `${entryColor}22`,
                              color: entryColor,
                              borderColor: `${entryColor}55`,
                            }}
                            className="capitalize"
                          >
                            {getStatusLabel(entry.status, locale)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDate(entry.date as Date | string | null)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}