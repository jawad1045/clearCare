import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CreateBHReferralForm } from "@/components/referrals/create-bh-referral-form";
import { ReferralHeader } from "@/components/referrals/referral-header";
import { getCurrentUser } from "@/lib/auth";
import { getUserById } from "@/action/user.action";
import { getServerTranslation } from "@/locale/server";

export const metadata: Metadata = {
  title: "Create B.H. Referral",
};

export default async function CreateBHReferralPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/");

  const user = await getUserById(session.id);
  if (!user) redirect("/");

  const { t } = await getServerTranslation();

  return (
    <div className="space-y-6 p-4">
      <ReferralHeader
        basePath="/admin/bhreferrals"
        title={t("referrals.createBhReferralPageTitle")}
        subtitle={t("referrals.createBhReferralPageSubtitle")}
        showCreate={false}
      />
      <CreateBHReferralForm referrerName={`${user.contactFirstName} ${user.contactLastName}`} />
    </div>
  );
}
