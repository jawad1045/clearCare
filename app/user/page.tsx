import type { Metadata } from "next";
import Link from "next/link";
import { getMyReferralCounts } from "@/action/referral.action";
import { getUserReportData } from "@/action/report.action";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ReportClient } from "@/components/reports/report-client";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function UserDashboardPage() {
  const [{ total }, reportRows] = await Promise.all([
    getMyReferralCounts(),
    getUserReportData(),
  ]);

  const bh = reportRows.filter((r) => r.type === "BH Referral").length;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-brand">My Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="border-t-4 border-t-brand">
          <CardHeader>
            <CardTitle className="text-brand">Referrals Submitted</CardTitle>
            <CardDescription className="text-sm">All referral submissions</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-brand">{total}</p>
                <p className="text-sm text-muted-foreground">Total referrals you've submitted</p>
              </div>
              <Link href="/user/referrals">
                <Button variant="outline">
                  View
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-brand">
          <CardHeader>
            <CardTitle className="text-brand">B.H. Referrals Submitted</CardTitle>
            <CardDescription className="text-sm">Behavioral Health referrals</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-brand">{bh}</p>
                <p className="text-sm text-muted-foreground">Behavioral Health referrals you've submitted</p>
              </div>
              <Link href="/user/bhreferrals">
                <Button variant="outline">
                  View
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports: filters, summary, charts, full data table */}
      <ReportClient rows={reportRows} isAdmin={false} />
    </div>
  );
}
