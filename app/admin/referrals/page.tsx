import { getReferrals } from "@/action/referral.action";
import { ReferralHeader } from "@/components/referrals/referral-header";
import { AdminReferralsTable } from "@/components/referrals/admin-referrals-table";

export default async function ReferralsPage() {
  const referrals = await getReferrals();

  return (
    <div className="space-y-6 p-6">
      <ReferralHeader basePath="/admin/referrals" showCreate={false} />
      <AdminReferralsTable
        referrals={referrals}
        basePath="/admin/referrals"
      />
    </div>
  );
}