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
      <ReferralHeader basePath="/admin/referrals" showCreate={false} />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Referrals</h2>
        <div className="rounded-md border px-4 py-2">
          <span className="text-sm text-muted-foreground">Total Referrals</span>
          <p className="text-2xl font-bold">{referrals.length}</p>
        </div>
      </div>

      <AdminReferralsTable
        referrals={referrals}
        basePath="/admin/referrals"
      />
    </div>
  );
}