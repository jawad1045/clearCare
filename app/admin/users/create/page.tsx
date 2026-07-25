import type { Metadata } from "next";
import { getCompanies } from "@/action/user.action";
import { getUserTitles } from "@/action/user-title.action";
import { CreateUserForm } from "@/components/users/create-user-form";

export const metadata: Metadata = {
  title: "Add User",
};

export default async function CreateUserPage() {
  const [companies, titles] = await Promise.all([
    getCompanies(),
    getUserTitles(),
  ]);

  return (
    <div className="container max-w-4xl py-6">
      <CreateUserForm companies={companies} initialCustomTitles={titles} />
    </div>
  );
}