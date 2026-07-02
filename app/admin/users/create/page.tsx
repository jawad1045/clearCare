import type { Metadata } from "next";
import { getCompanies } from "@/action/user.action";
import { CreateUserForm } from "@/components/users/create-user-form";

export const metadata: Metadata = {
  title: "Add User",
};

export default async function CreateUserPage() {
  const companies = await getCompanies();

  return (
    <div className="container max-w-4xl py-6">
      <CreateUserForm companies={companies} />
    </div>
  );
}