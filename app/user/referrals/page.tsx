import { getMyReferrals } from "@/action/referral.action";

import { ReferralsTable } from "@/components/referrals/referrals-table";
import { ReferralHeader } from "@/components/referrals/referral-header";

export default async function MyReferralsPage() {
  const referrals =
    await getMyReferrals();

  return (
    <div className="space-y-6 p-6">
      <ReferralHeader
        basePath="/user/referrals"
      />

      <ReferralsTable
        referrals={referrals}
        basePath="/user/referrals"
      />
    </div>
  );
}