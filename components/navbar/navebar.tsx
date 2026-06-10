// components/navbar/navbar.tsx

"use client";

import { adminMenu, userMenu } from "./role-menu";
import { NavLinks } from "./nav-link";
import { UserMenu } from "./user-menu";
import { NotificationBell } from "./notification-bell";

export function Navbar({ role = "user", name }: { role: "admin" | "user"; name: string }) {
  const menu = role === "admin" ? adminMenu : userMenu;

  return (
    <header>
      <div className="flex items-center justify-between gap-6 bg-[#1C2D35] px-4 py-3 text-gray-300 md:px-8">
        <div className="flex items-center gap-20">
          <div className="font-bold text-white">LOGO</div>
          <NavLinks menu={menu} role={role} name={name} />
        </div>

        <div className="hidden md:flex items-center gap-2">
          <NotificationBell />
          <UserMenu role={role} name={name} />
        </div>
      </div>
    </header>
  );
}