// components/navbar/navbar.tsx

"use client";

import { adminMenu, userMenu } from "./role-menu";
import { NavLinks } from "./nav-link";
import { UserMenu } from "./user-menu";

export function Navbar({ role = "user" }: { role: "admin" | "user" }) {
  const menu = role === "admin" ? adminMenu : userMenu;

  return (
    <header>
      <div className="flex items-center justify-between gap-6 bg-[#1C2D35] px-4 py-3 text-gray-300 md:px-8">
        <div className="flex items-center gap-20">
          <div className="font-bold text-white">LOGO</div>
          <NavLinks menu={menu} role={role} />
        </div>

        <div className="hidden md:flex items-center">
          <UserMenu role={role} />
        </div>
      </div>
    </header>
  );
}