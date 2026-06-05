import { getUsers } from "@/action/user.action";

import { UsersHeader } from "@/components/users/user-header";
import { UsersClient } from "@/components/users/users-client";

export default async function UsersPage() {
  const initialData = await getUsers();

  return (
    <div className="space-y-6 p-6">
      <UsersHeader />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Users
        </h2>

        <div className="rounded-md border px-4 py-2">
          <span className="text-sm text-muted-foreground">
            Total Users
          </span>

          <p className="text-2xl font-bold">
            {initialData.total}
          </p>
        </div>
      </div>

      <UsersClient initialData={initialData} />
    </div>
  );
}