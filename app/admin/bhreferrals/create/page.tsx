import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CreateBHReferralForm } from "@/components/referrals/create-bh-referral-form";
import { ReferralHeader } from "@/components/referrals/referral-header";
import { getCurrentUser } from "@/lib/auth";
import { getUserById } from "@/action/user.action";

export const metadata: Metadata = {
  title: "Create B.H. Referral",
};

export default async function CreateBHReferralPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/");

  const user = await getUserById(session.id);
  if (!user) redirect("/");

  return (
    <div className="space-y-6 p-4">
      <ReferralHeader
        basePath="/admin/bhreferrals"
        title="Create BH Referral"
        subtitle="Fill out the form below to submit a new behavioral health referral"
        showCreate={false}
      />
      <CreateBHReferralForm referrerName={`${user.contactFirstName} ${user.contactLastName}`} />
    </div>
  );
}
