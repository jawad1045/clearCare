"use client";

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
import { useTranslation } from "@/locale/use-translation";

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

const ROLE_LABEL_KEYS: Record<string, "common.roleAdmin" | "common.roleUser"> = {
  Admin: "common.roleAdmin",
  User: "common.roleUser",
};

export function UsersTable({
  users,
}: UsersTableProps) {
  const { t } = useTranslation();

  return (
    <div className="border">
      <Table>
        <TableHeader className="bg-sidebar text-sidebar-foreground">
          <TableRow>
            <TableHead className="text-sidebar-foreground">{t("common.name")}</TableHead>
            <TableHead className="text-sidebar-foreground">{t("common.email")}</TableHead>
            <TableHead className="text-sidebar-foreground">{t("common.organization")}</TableHead>
            <TableHead className="text-sidebar-foreground">{t("common.role")}</TableHead>
            <TableHead className="text-sidebar-foreground">{t("common.status")}</TableHead>
            <TableHead className="text-sidebar-foreground">{t("common.created")}</TableHead>
            <TableHead className="w-56 text-sidebar-foreground">
              {t("common.actions")}
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
                {t("users.noUsersFound")}
              </TableCell>
            </TableRow>
          ) : (
            users.map((user, i) => (
              <TableRow key={user.id} className={`transition-colors hover:bg-muted/50
               ${i % 2 === 1 ? "table-row-even" : "table-row-odd"}`}>
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
                    {ROLE_LABEL_KEYS[user.userRole] ? t(ROLE_LABEL_KEYS[user.userRole]) : user.userRole}
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
                      ? t("common.active")
                      : t("common.inactive")}
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
                        {t("common.edit")}
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