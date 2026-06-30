import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserReportData } from "@/action/report.action";
import { ReportClient } from "@/components/reports/report-client";

export const metadata: Metadata = {
  title: "Reports",
};

export default async function UserReportsPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/");

  const rows = await getUserReportData();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Reports</h1>
        <p className="text-muted-foreground text-sm">
          Filter, analyze, and export your referral history.
        </p>
      </div>
      <ReportClient rows={rows} isAdmin={false} />
    </div>
  );
}
