// components/navbar/navbar.tsx

"use client";

import { adminMenu, userMenu } from "./role-menu";
import { NavLinks } from "./nav-link";
import { UserMenu } from "./user-menu";

export function Navbar({ role = "user" }: { role: "admin" | "user" }) {
  const menu = role === "admin" ? adminMenu : userMenu;

  return (
    <header className="">
      {/* Left */}
      <div className="flex items-center gap-20 h-full bg-[#1C2D35]  text-gray-300 ">
        <div className="font-bold">LOGO</div>
        <NavLinks menu={menu} />
      </div>

      {/* Right */}
   
    </header>
  );
}