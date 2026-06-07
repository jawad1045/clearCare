import { getBHReferrals } from "@/action/referral.action";
import { ReferralHeader } from "@/components/referrals/referral-header";
import { AdminReferralsTable } from "@/components/referrals/admin-referrals-table";

export default async function BHReferralsPage() {
  const referrals = await getBHReferrals();

  return (
    <div className="space-y-6 p-6">
      <ReferralHeader basePath="/admin/bhreferrals" title="Behavioral Health Referrals" />
      <AdminReferralsTable
        referrals={referrals}
        basePath="/admin/bhreferrals"
      />
    </div>
  );
}
