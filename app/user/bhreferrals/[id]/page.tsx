import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getBHReferralById } from "@/action/bh-referral.action";
import { getCurrentUser } from "@/lib/auth";
import { getStatusColor, getStatusLabel } from "@/lib/referral-statuses";
import { getServerTranslation } from "@/locale/server";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserBHReferralDetailTabs } from "@/components/referrals/user-bh-referral-detail-tabs";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "B.H. Referral Details",
};

export default async function UserBHReferralDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const referral = await getBHReferralById(Number(id));

  if (!referral) {
    notFound();
  }

  const currentUser = await getCurrentUser();

  // Security check: restrict non-admins to their own records
  if (!currentUser || (currentUser.role !== "Admin" && referral.userId !== currentUser.id)) {
    redirect("/user");
  }

  const { t, locale } = await getServerTranslation();

  const currentStatusColor = getStatusColor(referral.status);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Navigation Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="-ml-2 mb-4 text-muted-foreground"
          >
            <Link href="/user/bhreferrals">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              {t("referrals.backToBhReferrals")}
            </Link>
          </Button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {t("referrals.bhReferralHeading")}{" "}
                <span className="font-normal text-muted-foreground">
                  #{referral.id}
                </span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {referral.firstName} {referral.lastName} &mdash;{" "}
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

        <UserBHReferralDetailTabs referral={referral as any} />

      </div>
    </div>
  );
}