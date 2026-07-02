import type { Metadata } from "next";
import Link from "next/link";
import { getUsersCount } from "@/action/user.action";
import { getCompaniesCount } from "@/action/company.action";
import { getReferralsCount } from "@/action/referral.action";
import { getBHReferralsCount } from "@/action/bh-referral.action";
import { getAdminReportData } from "@/action/report.action";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportClient } from "@/components/reports/report-client";

import {
  Users,
  Building2,
  Receipt,
  Brain,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function AdminPage() {
  const [totalUsers, totalCompanies, totalReferrals, totalBHReferrals, reportRows] =
    await Promise.all([
      getUsersCount(),
      getCompaniesCount(),
      getReferralsCount(),
      getBHReferralsCount(),
      getAdminReportData(),
    ]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-brand">Dashboard</h1>
        <p className="text-muted-foreground">System overview</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {/* Total Users */}
        <Card className="border-t-4 border-t-sidebar">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-brand">Total Users</CardTitle>
            <Users className="h-6 w-6 text-brand" />
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold text-brand">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </div>
            <Link href="/admin/users">
              <Button variant="outline" size="sm">
                View <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Total Companies */}
        <Card className="border-t-4 border-t-sidebar">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-brand">Total Companies</CardTitle>
            <Building2 className="h-6 w-6 text-brand" />
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold text-brand">{totalCompanies}</div>
              <p className="text-xs text-muted-foreground">Registered companies</p>
            </div>
            <Link href="/admin/companies">
              <Button variant="outline" size="sm">
                View <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Referrals */}
        <Card className="border-t-4 border-t-sidebar">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-brand">Referrals</CardTitle>
            <Receipt className="h-6 w-6 text-brand" />
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold text-brand">{totalReferrals}</div>
              <p className="text-xs text-muted-foreground">Total referrals</p>
            </div>
            <Link href="/admin/referrals">
              <Button variant="outline" size="sm">
                View <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* B.H. Referrals */}
        <Card className="border-t-4 border-t-sidebar">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-brand">B.H. Referrals</CardTitle>
            <Brain className="h-6 w-6 text-brand" />
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold text-brand">{totalBHReferrals}</div>
              <p className="text-xs text-muted-foreground">Behavioral Health referrals</p>
            </div>
            <Link href="/admin/bhreferrals">
              <Button variant="outline" size="sm">
                View <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Reports: filters, stat cards, charts, full data table */}
      <ReportClient rows={reportRows} isAdmin />
    </div>
  );
}
