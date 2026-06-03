import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export function UsersHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Users
        </h1>

        <p className="text-muted-foreground">
          Manage users and permissions
        </p>
      </div>

      <Button asChild>
        <Link href="/admin/users/create">
          <Plus className="mr-2 h-4 w-4" />
          Create User
        </Link>
      </Button>
    </div>
  );
}