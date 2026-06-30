// components/navbar/nav-links.tsx

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { ThemeToggle } from "./theme-toggle";

export function NavLinks({ menu, role, name }: any) {
  const [openMobile, setOpenMobile] = React.useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <div className="w-full bg-sidebar">
      {/* ========================================== */}
      {/* DESKTOP NAVIGATION                         */}
      {/* ========================================== */}
      <nav className="hidden md:flex items-center w-full h-full p-4 gap-8 text-sm text-sidebar-foreground">
        {menu.map((item: any) =>
          item.children ? (
            <DropdownMenu key={item.label}>
              <DropdownMenuTrigger
                className={`flex items-center gap-1 rounded-md px-3 py-1.5 transition-colors duration-200 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground focus:outline-none ${
                  item.children.some((child: any) => isActive(child.href))
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : ""
                }`}
              >
                {item.label}
                <ChevronDown className="h-4 w-4 opacity-70" />
              </DropdownMenuTrigger>

              <DropdownMenuContent className="bg-sidebar border border-slate-700 text-sidebar-foreground min-w-40 rounded-md shadow-lg p-1">
                {item.children.map((child: any) => (
                  <DropdownMenuItem key={child.href} asChild>
                    <Link
                      href={child.href}
                      className={`block w-full px-3 py-2 rounded-sm transition-colors duration-200 hover:bg-slate-800 hover:text-sidebar-accent-foreground focus:bg-slate-800 focus:text-sidebar-accent-foreground ${
                        isActive(child.href) ? "bg-slate-800 text-sidebar-accent-foreground" : ""
                      }`}
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
              className={`rounded-md px-3 py-1.5 transition-colors duration-200 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground ${
                isActive(item.href)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : ""
              }`}
            >
              {item.label}
            </Link>
          )
        )}
      </nav>

      {/* ========================================== */}
      {/* MOBILE NAVIGATION                          */}
      {/* ========================================== */}
      <div className="flex md:hidden items-center justify-between p-4 text-sidebar-foreground">
        <span className="font-semibold text-sidebar-accent-foreground text-sm">
          {role === "admin" ? "Administrator" : "Company User"}
        </span>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu role={role} name={name} />

          <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetTrigger asChild>
            <button className="p-2 -mr-2 text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors focus:outline-none">
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          
          {/* Mobile Draw Panel styled in Midnight Teal */}
          <SheetContent 
            side="right" 
            className="w-75 bg-sidebar border-l border-slate-800 p-6 text-sidebar-foreground"
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
                            className={`block py-2 text-sm transition-colors duration-200 hover:text-sidebar-accent-foreground focus:text-sidebar-accent-foreground ${
                              isActive(child.href) ? "text-sidebar-accent-foreground" : ""
                            }`}
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
                      className={`block py-1 text-base font-medium transition-colors duration-200 hover:text-sidebar-accent-foreground focus:text-sidebar-accent-foreground ${
                        isActive(item.href) ? "text-sidebar-accent-foreground" : ""
                      }`}
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