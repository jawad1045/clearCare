import { CreateBHReferralForm } from "@/components/referrals/create-bh-referral-form";
import { ReferralHeader } from "@/components/referrals/referral-header";

export default function CreateBHReferralPage() {
  return (
    <div className="space-y-6 p-6">
      <ReferralHeader
        basePath="/admin/bhreferrals"
        title="Create BH Referral"
        subtitle="Fill out the form below to submit a new behavioral health referral"
        showCreate={false}
      />
      <CreateBHReferralForm />
    </div>
  );
}
