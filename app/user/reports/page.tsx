import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserReportData } from "@/action/report.action";
import { ReportClient } from "@/components/reports/report-client";
import { getServerTranslation } from "@/locale/server";

export const metadata: Metadata = {
  title: "Reports",
};

export default async function UserReportsPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/");

  const rows = await getUserReportData();
  const { t } = await getServerTranslation();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("reports.myReportsTitle")}</h1>
        <p className="text-muted-foreground text-sm">
          {t("reports.myReportsSubtitle")}
        </p>
      </div>
      <ReportClient rows={rows} isAdmin={false} />
    </div>
  );
}
