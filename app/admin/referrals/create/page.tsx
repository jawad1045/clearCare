import { CreateReferralForm } from "@/components/referrals/create-referral-form";
import { ReferralHeader } from "@/components/referrals/referral-header";

export default function CreateReferralPage() {
  return (
    <div className="space-y-6 p-6">
      <ReferralHeader
        basePath="/admin/referrals"
        title="Create Referral"
        subtitle="Fill out the form below to submit a new referral"
        showCreate={false}
      />
      <CreateReferralForm />
    </div>
  );
}
