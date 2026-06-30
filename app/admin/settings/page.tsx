import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Separator } from "@/components/ui/separator";
import { SettingsForm } from "@/components/settings/settings-form";
import { getSessionTimeoutMinutes } from "@/action/settings.action";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function AdminSettingsPage() {
  const session = await getCurrentUser();
  if (!session || session.role !== "Admin") redirect("/user");

  const sessionTimeoutMinutes = await getSessionTimeoutMinutes();

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your notifications, appearance, and system configuration.
        </p>
      </div>
      <Separator />
      <SettingsForm initialSessionTimeoutMinutes={sessionTimeoutMinutes} />
    </div>
  );
}
