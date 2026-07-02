import type { Metadata } from "next";
import { getUsers } from "@/action/user.action";

import { UsersHeader } from "@/components/users/user-header";
import { UsersClient } from "@/components/users/users-client";

export const metadata: Metadata = {
  title: "Users",
};

export default async function UsersPage() {
  const initialData = await getUsers();

  return (
    <div className="space-y-6 p-6">
      <UsersHeader total={initialData.total} />

      <UsersClient initialData={initialData} />
    </div>
  );
}