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
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-30">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center"
              >
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
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
                  <Link
                    href={`/admin/users/${user.id}/edit`}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                    >
                      Edit
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}