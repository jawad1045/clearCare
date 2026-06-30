import type { Metadata } from "next";
import { getCompanies, getUserById } from "@/action/user.action";
import { UserDetailTabs } from "@/components/users/user-detail-tabs";

export const metadata: Metadata = {
  title: "Edit User",
};

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [user, companies] = await Promise.all([
    getUserById(Number(id)),
    getCompanies(),
  ]);

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <UserDetailTabs user={user} companies={companies} />
    </div>
  );
}