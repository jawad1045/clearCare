// components/navbar/nav-links.tsx

"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, ChevronDown } from "lucide-react"; // Install lucide-react if you haven't already
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { UserMenu } from "./user-menu";

export function NavLinks({ menu, role }: any) {
  const [openMobile, setOpenMobile] = React.useState(false);

  return (
    <div className="w-full bg-[#1C2D35]">
      {/* ========================================== */}
      {/* DESKTOP NAVIGATION                         */}
      {/* ========================================== */}
      <nav className="hidden md:flex items-center w-full h-full p-4 gap-8 text-sm text-gray-300">
        {menu.map((item: any) =>
          item.children ? (
            <DropdownMenu key={item.label}>
              <DropdownMenuTrigger className="flex items-center gap-1 transition-colors duration-200 hover:text-[#7DDDD5] focus:outline-none">
                {item.label}
                <ChevronDown className="h-4 w-4 opacity-70" />
              </DropdownMenuTrigger>

              <DropdownMenuContent className="bg-[#1C2D35] border border-slate-700 text-gray-300 min-w-40 rounded-md shadow-lg p-1">
                {item.children.map((child: any) => (
                  <DropdownMenuItem key={child.href} asChild>
                    <Link
                      href={child.href}
                      className="block w-full px-3 py-2 rounded-sm transition-colors duration-200 hover:bg-slate-800 hover:text-[#7DDDD5] focus:bg-slate-800 focus:text-[#7DDDD5]"
                    >
                      {child.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors duration-200 hover:text-[#7DDDD5]"
            >
              {item.label}
            </Link>
          )
        )}
      </nav>

      {/* ========================================== */}
      {/* MOBILE NAVIGATION                          */}
      {/* ========================================== */}
      <div className="flex md:hidden items-center justify-between p-4 text-gray-300">
        <span className="font-semibold text-[#7DDDD5] text-sm">
          {role === "admin" ? "Administrator" : "Company User"}
        </span>

        <div className="flex items-center gap-2">
          <UserMenu role={role} />

          <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetTrigger asChild>
            <button className="p-2 -mr-2 text-gray-300 hover:text-[#7DDDD5] transition-colors focus:outline-none">
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          
          {/* Mobile Draw Panel styled in Midnight Teal */}
          <SheetContent 
            side="right" 
            className="w-75 bg-[#1C2D35] border-l border-slate-800 p-6 text-gray-300"
          >
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <nav className="flex flex-col gap-6 mt-6">
              {menu.map((item: any) => (
                <div key={item.label} className="flex flex-col gap-2">
                  {item.children ? (
                    <>
                      {/* Parent label header in mobile */}
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {item.label}
                      </span>
                      {/* Nested mobile links */}
                      <div className="flex flex-col gap-1 pl-3 border-l border-slate-800">
                        {item.children.map((child: any) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setOpenMobile(false)}
                            className="block py-2 text-sm transition-colors duration-200 hover:text-[#7DDDD5] focus:text-[#7DDDD5]"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    /* Top level standalone link in mobile */
                    <Link
                      href={item.href}
                      onClick={() => setOpenMobile(false)}
                      className="block py-1 text-base font-medium transition-colors duration-200 hover:text-[#7DDDD5] focus:text-[#7DDDD5]"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </SheetContent>
        </Sheet>        </div>      </div>
    </div>
  );
}