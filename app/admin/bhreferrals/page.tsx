import type { Metadata } from "next";
import { getBHReferrals } from "@/action/bh-referral.action";
import { ReferralHeader } from "@/components/referrals/referral-header";
import { AdminBHReferralsTable } from "@/components/referrals/admin-bh-referrals-table";

export const metadata: Metadata = {
  title: "B.H. Referrals",
};

export default async function BHReferralsPage() {
  const referrals = await getBHReferrals();

  return (
    <div className="space-y-6 p-6">
      <ReferralHeader basePath="/admin/bhreferrals" title="Behavioral Health Referrals" showCreate={false} />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">B.H. Referrals</h2>
        <div className="rounded-md border px-4 py-2">
          <span className="text-sm text-muted-foreground">Total B.H. Referrals</span>
          <p className="text-2xl font-bold">{referrals.length}</p>
        </div>
      </div>

      <AdminBHReferralsTable
        referrals={referrals}
        basePath="/admin/bhreferrals"
      />
    </div>
  );
}
