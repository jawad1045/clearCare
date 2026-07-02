import type { Metadata } from "next";
import { getReferrals } from "@/action/referral.action";
import { ReferralHeader } from "@/components/referrals/referral-header";
import { AdminReferralsTable } from "@/components/referrals/admin-referrals-table";

export const metadata: Metadata = {
  title: "Referrals",
};

export default async function ReferralsPage() {
  const referrals = await getReferrals();

  return (
    <div className="space-y-6 p-6">
      <ReferralHeader basePath="/admin/referrals" showCreate={false} total={referrals.length} />

      <AdminReferralsTable
        referrals={referrals}
        basePath="/admin/referrals"
      />
    </div>
  );
}