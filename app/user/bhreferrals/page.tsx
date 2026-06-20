import { getMyBHReferrals } from "@/action/bh-referral.action";
import { ReferralHeader } from "@/components/referrals/referral-header";
import { UserReferralsTable } from "@/components/referrals/user-referrals-table";

export default async function MyBHReferralsPage() {
  const referrals = await getMyBHReferrals();

  return (
    <div className="space-y-6 p-6">
      <ReferralHeader basePath="/user/bhreferrals" title="My Behavioral Health Referrals" />
      <UserReferralsTable referrals={referrals} basePath="/user/bhreferrals" />
    </div>
  );
}
