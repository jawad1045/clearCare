// components/navbar/user-menu.tsx

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/action/auth/auth.model";
import { Shield, User, LogOut, Settings, ChevronDown } from "lucide-react";
import { useTranslation } from "@/locale/use-translation";

export function UserMenu({ role, name }: { role: "admin" | "user"; name: string }) {
  const router = useRouter();
  const { t } = useTranslation();

  async function handleLogout() {
    const result = await logoutAction();

    if (result?.success) {
      router.push("/");
    }
  }

  const isAdmin = role === "admin";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="group inline-flex items-center gap-2 rounded-full border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-100 transition-colors duration-200 hover:bg-slate-800"
        >
          <Avatar
            size="sm"
            className={cn(
              "transition-colors duration-200",
              isAdmin
                ? "bg-amber-600 text-slate-950 group-hover:bg-slate-800 group-hover:text-sidebar-accent-foreground"
                : "bg-sky-500 text-white group-hover:bg-slate-800 group-hover:text-sidebar-accent-foreground"
            )}
          >
            {isAdmin ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
          </Avatar>
          <span className="hidden md:inline">{name}</span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 bg-slate-950 border border-slate-800">
        <div className="space-y-1 px-4 py-3">
          <p className="text-sm font-semibold text-slate-100">{name}</p>
          <p className="text-xs text-slate-500">
            {isAdmin ? t("userMenu.fullAccess") : t("userMenu.limitedAccess")}
          </p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={`/${role}/profile`} className="flex items-center gap-2 text-slate-100">
            <User className="h-4 w-4" />
            {t("userMenu.profile")}
          </Link>
        </DropdownMenuItem>

        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin/settings" className="flex items-center gap-2 text-slate-100">
              <Settings className="h-4 w-4" />
              {t("userMenu.settings")}
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 text-destructive"
          >
            <LogOut className="h-4 w-4" />
            {t("userMenu.logout")}
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}