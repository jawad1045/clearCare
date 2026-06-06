import { getMyReferrals } from "@/action/referral.action";
import { ReferralHeader } from "@/components/referrals/referral-header";
import { UserReferralsTable } from "@/components/referrals/user-referrals-table";

export default async function MyReferralsPage() {
  const referrals =
    await getMyReferrals();

  return (
    <div className="space-y-6 p-6">
      <ReferralHeader
        basePath="/user/referrals"
      />

      <UserReferralsTable
        referrals={referrals}
        basePath="/user/referrals"
      />
    </div>
  );
}