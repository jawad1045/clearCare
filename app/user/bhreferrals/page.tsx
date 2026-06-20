import { getMyBHReferrals } from "@/action/bh-referral.action";
import { ReferralHeader } from "@/components/referrals/referral-header";
import { UserBHReferralsTable } from "@/components/referrals/user-bh-referrals-table";

export default async function MyBHReferralsPage() {
  const referrals = await getMyBHReferrals();

  return (
    <div className="space-y-6 p-6">
      <ReferralHeader basePath="/user/bhreferrals" title="My Behavioral Health Referrals" />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">B.H. Referrals</h2>
        <div className="rounded-md border px-4 py-2">
          <span className="text-sm text-muted-foreground">Total B.H. Referrals</span>
          <p className="text-2xl font-bold">{referrals.length}</p>
        </div>
      </div>

      <UserBHReferralsTable referrals={referrals} basePath="/user/bhreferrals" />
    </div>
  );
}
