import {
  getCompanies,
  getUserById,
} from "@/action/user.action";

import {
  EditUserForm,
} from "@/components/users/edit-user-form";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } =
    await params;

  const user =
    await getUserById(
      Number(id)
    );

  const companies =
    await getCompanies();

  if (!user) {
    return (
      <div>
        User not found
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <EditUserForm
        user={user}
        companies={
          companies
        }
      />
    </div>
  );
}