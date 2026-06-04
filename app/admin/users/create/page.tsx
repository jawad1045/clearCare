import { getCompanies } from "@/action/user.action";
import { CreateUserForm } from "@/components/users/create-user-form";

export default async function CreateUserPage() {
  const companies = await getCompanies();

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <CreateUserForm companies={companies} />
    </div>
  );
}