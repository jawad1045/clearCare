import { getUsersCount } from "@/action/user.action";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Users } from "lucide-react";

export default async function AdminPage() {
  const totalUsers =
    await getUsersCount();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="text-muted-foreground">
          System overview
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>

            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold">
              {totalUsers}
            </div>

            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}