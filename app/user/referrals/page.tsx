import type { Metadata } from "next";
import { getMyReferrals } from "@/action/referral.action";
import { ReferralHeader } from "@/components/referrals/referral-header";
import { UserReferralsTable } from "@/components/referrals/user-referrals-table";

export const metadata: Metadata = {
  title: "Referrals",
};

export default async function MyReferralsPage() {
  const data = await getMyReferrals();

  return (
    <div className="space-y-6 p-6">
      <ReferralHeader
        basePath="/user/referrals"
        total={data.total}
      />

      <UserReferralsTable
        referrals={data.referrals}
        basePath="/user/referrals"
      />
    </div>
  );
}