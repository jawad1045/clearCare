import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBHReferralById } from "@/action/bh-referral.action";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { appConfig } from "@/next.config";
import { getStatusColor, getStatusLabel } from "@/lib/referral-statuses";
import { MentalHealthReferralDetailTabs } from "@/components/referrals/mental-health-referral-detail-tabs";
import { getServerTranslation } from "@/locale/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "B.H. Referral Details",
};

export default async function BHReferralDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const referral = await getBHReferralById(Number(id));

  if (!referral) notFound();

  const { t, locale } = await getServerTranslation();

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="mb-8">
          <div className="mb-6">
            {/* <p className="text-xs font-semibold uppercase tracking-widest text-primary">{appConfig.name}</p>
            <p className="text-xs text-muted-foreground">{appConfig.slogan}</p> */}
          </div>

          <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 text-muted-foreground rounded-md">
            <Link href="/admin/bhreferrals">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              {t("referrals.backToBhReferrals")}
            </Link>
          </Button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {t("referrals.bhReferralHeading")} <span className="text-muted-foreground font-normal">#{referral.id}</span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {referral.firstName} {referral.lastName} &mdash; {t("referrals.submittedByPrefix")}{" "}
                {referral.user.contactFirstName} {referral.user.contactLastName}
              </p>
            </div>
            <Badge
              variant="secondary"
              style={{
                color: getStatusColor(referral.status),
                borderColor: getStatusColor(referral.status) + "55",
              }}
              className="mt-1 p-1 bg-background border-0 shrink-0  capitalize"
            >
              {t("referrals.currentStatusPrefix")} {getStatusLabel(referral.status, locale)}
            </Badge>
          </div>
        </div>

        <MentalHealthReferralDetailTabs referral={referral} />

      </div>
    </div>
  );
}
