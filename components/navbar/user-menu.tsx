// components/navbar/user-menu.tsx

"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function UserMenu({ role }: { role: "admin" | "user" }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-start gap-2">
        👤
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/${role}/profile`}>Profile</Link>
        </DropdownMenuItem>

        {role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/admin/settings">Settings</Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem className="text-red-500">
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}