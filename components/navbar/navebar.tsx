// components/navbar/navbar.tsx

"use client";

import Image from "next/image";
import { adminMenu, userMenu } from "./role-menu";
import { NavLinks } from "./nav-link";
import { UserMenu } from "./user-menu";
import { NotificationBell } from "./notification-bell";
import { ThemeToggle } from "./theme-toggle";

export function Navbar({ role = "user", name }: { role: "admin" | "user"; name: string }) {
  const menu = role === "admin" ? adminMenu : userMenu;

  return (
    <header className="print:hidden">
      <div className="flex items-center justify-between gap-6 bg-sidebar px-4 py-3 text-sidebar-foreground md:px-8">
        <div className="flex items-center gap-20">
          <Image src="/logo.png" alt="HWP Logo" width={70} height={40} className="object-contain" priority />
          <NavLinks menu={menu} role={role} name={name} />
        </div>

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <NotificationBell />
          <UserMenu role={role} name={name} />
        </div>
      </div>
    </header>
  );
}