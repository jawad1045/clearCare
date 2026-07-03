import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAdminReportData } from "@/action/report.action";
import { ReportClient } from "@/components/reports/report-client";
import { getServerTranslation } from "@/locale/server";

export const metadata: Metadata = {
  title: "Reports",
};

export default async function AdminReportsPage() {
  const session = await getCurrentUser();
  if (!session || session.role !== "Admin") redirect("/user");

  const rows = await getAdminReportData();
  const { t } = await getServerTranslation();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("reports.pageTitle")}</h1>
        <p className="text-muted-foreground text-sm">
          {t("reports.pageSubtitle")}
        </p>
      </div>
      <ReportClient rows={rows} isAdmin />
    </div>
  );
}
