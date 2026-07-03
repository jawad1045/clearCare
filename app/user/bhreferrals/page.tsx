import type { Metadata } from "next";
import { getMyBHReferrals } from "@/action/bh-referral.action";
import { ReferralHeader } from "@/components/referrals/referral-header";
import { UserBHReferralsTable } from "@/components/referrals/user-bh-referrals-table";
import { getServerTranslation } from "@/locale/server";

export const metadata: Metadata = {
  title: "B.H. Referrals",
};

export default async function MyBHReferralsPage() {
  const referrals = await getMyBHReferrals();
  const { t } = await getServerTranslation();

  return (
    <div className="space-y-6 p-6">
      <ReferralHeader basePath="/user/bhreferrals" title={t("referrals.bhPageTitleUser")} total={referrals.length} />

      <UserBHReferralsTable referrals={referrals} basePath="/user/bhreferrals" />
    </div>
  );
}
