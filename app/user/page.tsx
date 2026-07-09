import type { Metadata } from "next";
import Link from "next/link";
import { getMyReferralCounts } from "@/action/referral.action";
import { getUserReportData } from "@/action/report.action";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ReportClient } from "@/components/reports/report-client";
import { getServerTranslation } from "@/locale/server";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function UserDashboardPage() {
  const [{ total }, reportRows] = await Promise.all([
    getMyReferralCounts(),
    getUserReportData(),
  ]);

  const bh = reportRows.filter((r) => r.type === "BH Referral").length;

  const { t } = await getServerTranslation();

  return (
    <div className="mx-auto w-full max-w-screen-2xl space-y-6 px-10 py-6">
      <div>
        <h1 className="text-3xl font-bold text-brand">{t("dashboard.myDashboard")}</h1>
        <p className="text-muted-foreground">{t("dashboard.totalReferralsSubmitted")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-t-4 border-t-brand">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-brand">{t("dashboard.referralsSubmitted")}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-brand">{total}</p>
              <p className="text-xs text-muted-foreground">{t("dashboard.allReferralSubmissions")}</p>
            </div>
            <Link href="/user/referrals">
              <Button variant="outline" size="sm">
                {t("common.view")} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-brand">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-brand">{t("dashboard.bhReferralsSubmitted")}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-brand">{bh}</p>
              <p className="text-xs text-muted-foreground">{t("dashboard.totalBhReferralsSubmitted")}</p>
            </div>
            <Link href="/user/bhreferrals">
              <Button variant="outline" size="sm">
                {t("common.view")} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Reports: filters, summary, charts, full data table */}
      <ReportClient rows={reportRows} isAdmin={false} />
    </div>
  );
}
