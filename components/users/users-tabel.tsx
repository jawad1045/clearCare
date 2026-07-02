import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResetPasswordDialog } from "@/components/users/reset-password-dialog";

type User = {
  id: number;
  organization: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  userRole: string;
  isActive: boolean;
  createdDate: Date;
};

type UsersTableProps = {
  users: User[];
};

export function UsersTable({
  users,
}: UsersTableProps) {
  return (
    <div className="border">
      <Table>
        <TableHeader className="bg-sidebar text-sidebar-foreground">
          <TableRow>
            <TableHead className="text-sidebar-foreground">Name</TableHead>
            <TableHead className="text-sidebar-foreground">Email</TableHead>
            <TableHead className="text-sidebar-foreground">Organization</TableHead>
            <TableHead className="text-sidebar-foreground">Role</TableHead>
            <TableHead className="text-sidebar-foreground">Status</TableHead>
            <TableHead className="text-sidebar-foreground">Created</TableHead>
            <TableHead className="w-56 text-sidebar-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-8 text-center text-muted-foreground"
              >
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user, i) => (
              <TableRow key={user.id} className="transition-colors hover:bg-muted/50" style={i % 2 === 0 ? { backgroundColor: "#F8FAFC" } : undefined}>
                <TableCell>
                  {user.contactFirstName}{" "}
                  {user.contactLastName}
                </TableCell>

                <TableCell>
                  {user.contactEmail}
                </TableCell>

                <TableCell>
                  {user.organization}
                </TableCell>

                <TableCell>
                  <Badge variant="outline">
                    {user.userRole}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      user.isActive
                        ? "default"
                        : "secondary"
                    }
                  >
                    {user.isActive
                      ? "Active"
                      : "Inactive"}
                  </Badge>
                </TableCell>

                <TableCell>
                  {new Date(
                    user.createdDate
                  ).toLocaleDateString()}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/users/${user.id}/edit`}>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </Link>
                    <ResetPasswordDialog
                      userId={user.id}
                      userName={`${user.contactFirstName} ${user.contactLastName}`}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}