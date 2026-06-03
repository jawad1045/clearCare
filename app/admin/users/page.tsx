import { getUsers } from "@/action/user.action";

import { UsersHeader } from "@/components/users/user-header";
import { UsersClient } from "@/components/users/users-client";

export default async function UsersPage() {
  const initialData = await getUsers();

  return (
    <div className="space-y-6 p-6">
      <UsersHeader />
      <UsersClient initialData={initialData} />
    </div>
  );
}