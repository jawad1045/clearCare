import { redirect } from "next/navigation";

import { CreateReferralForm } from "@/components/referrals/create-referral-form";
import { ReferralHeader } from "@/components/referrals/referral-header";
import { getCurrentUser } from "@/lib/auth";
import { getUserById } from "@/action/user.action";

export default async function CreateReferralPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/");

  const user = await getUserById(session.id);
  if (!user) redirect("/");

  return (
    <div className="space-y-6 p-6">
      <ReferralHeader
        basePath="/admin/referrals"
        title="Create Referral"
        subtitle="Fill out the form below to submit a new referral"
        showCreate={false}
      />
      <CreateReferralForm referrerName={`${user.contactFirstName} ${user.contactLastName}`} />
    </div>
  );
}
