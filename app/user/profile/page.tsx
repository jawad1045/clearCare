import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserById } from "@/action/user.action";
import { ProfileForm } from "@/components/profile/profile-form";
import { getServerTranslation } from "@/locale/server";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function UserProfilePage() {
  const session = await getCurrentUser();
  if (!session) redirect("/");

  const user = await getUserById(session.id);
  if (!user) redirect("/");

  const { t } = await getServerTranslation();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("profile.myProfileTitle")}</h1>
        <p className="text-muted-foreground text-sm">{t("profile.viewNameManagePassword")}</p>
      </div>
      <ProfileForm
        firstName={user.contactFirstName}
        lastName={user.contactLastName}
        email={user.contactEmail}
        redirectTo="/user"
        canEditName={false}
      />
    </div>
  );
}
