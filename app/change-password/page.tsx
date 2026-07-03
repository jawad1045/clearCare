import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserById } from "@/action/user.action";
import { ChangePasswordForm } from "@/components/change-password-form";
import { getServerTranslation } from "@/locale/server";

export const metadata: Metadata = {
  title: "Change Password",
};

export default async function ChangePasswordPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  const dbUser = await getUserById(user.id);
  if (!dbUser) {
    redirect("/");
  }

  if (!dbUser.mustChangePassword) {
    const { t } = await getServerTranslation();
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background text-foreground">
        <h1 className="text-xl font-bold">{t("app.linkExpiredTitle")}</h1>
        <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
          {t("app.linkExpiredBody")}
        </p>
      </div>
    );
  }

  return <ChangePasswordForm />;
}
