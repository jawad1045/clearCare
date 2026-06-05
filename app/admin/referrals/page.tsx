import { getReferrals } from "@/action/referral.action";

import { ReferralsTable } from "@/components/referrals/referrals-table";
import { ReferralHeader } from "@/components/referrals/referral-header";

export default async function ReferralsPage() {
  const referrals =
    await getReferrals();

  return (
    <div className="space-y-6 p-6">
      <ReferralHeader
        basePath="/admin/referrals"
      />

      <ReferralsTable
        referrals={referrals}
        basePath="/admin/referrals"
      />
    </div>
  );
}