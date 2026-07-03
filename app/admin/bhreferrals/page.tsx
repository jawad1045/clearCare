import type { Metadata } from "next";
import { getBHReferrals } from "@/action/bh-referral.action";
import { ReferralHeader } from "@/components/referrals/referral-header";
import { AdminBHReferralsTable } from "@/components/referrals/admin-bh-referrals-table";
import { getServerTranslation } from "@/locale/server";

export const metadata: Metadata = {
  title: "B.H. Referrals",
};

export default async function BHReferralsPage() {
  const referrals = await getBHReferrals();
  const { t } = await getServerTranslation();

  return (
    <div className="space-y-6 p-6">
      <ReferralHeader basePath="/admin/bhreferrals" title={t("referrals.bhPageTitleAdmin")} showCreate={false} total={referrals.length} />

      <AdminBHReferralsTable
        referrals={referrals}
        basePath="/admin/bhreferrals"
      />
    </div>
  );
}
