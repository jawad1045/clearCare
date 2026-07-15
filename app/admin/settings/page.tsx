import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Separator } from "@/components/ui/separator";
import { SettingsForm } from "@/components/settings/settings-form";
import { getSessionTimeoutMinutes } from "@/action/settings.action";
import { getServerTranslation } from "@/locale/server";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function AdminSettingsPage() {
  const session = await getCurrentUser();
  if (!session || session.role !== "Admin") redirect("/user");

  const sessionTimeoutMinutes = await getSessionTimeoutMinutes();
  const { t } = await getServerTranslation();

  const portalName = process.env.NEXT_PUBLIC_APP_NAME ?? "HWP Portal";
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@hwp.com";

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">{t("settings.pageTitle")}</h2>
        <p className="text-muted-foreground">
          {t("settings.pageSubtitle")}
        </p>
      </div>
      <Separator />
      <SettingsForm
        initialSessionTimeoutMinutes={sessionTimeoutMinutes}
        portalName={portalName}
        supportEmail={supportEmail}
      />
    </div>
  );
}
