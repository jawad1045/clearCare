// components/navbar/nav-links.tsx

"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function NavLinks({ menu }: any) {
  return (
    // Styled the background with Midnight Teal (#1C2D35) and default text to a slightly muted variation for hierarchy
    <nav className="hidden md:flex items-center w-full h-full p-4 gap-20  text-sm bg-[#1C2D35] text-gray-300">
      {menu.map((item: any) =>
        item.children ? (
          <DropdownMenu key={item.label}>
            {/* Added Teal Glow (#7DDDD5) on hover */}
            <DropdownMenuTrigger className="transition-colors duration-200 hover:text-[#7DDDD5] focus:outline-none">
              {item.label}
            </DropdownMenuTrigger>

            {/* Structured dropdown menu matching the Midnight Teal background */}
            <DropdownMenuContent className="bg-[#1C2D35] border border-slate-700 text-gray-300 min-w-40 rounded-md shadow-lg p-1">
              {item.children.map((child: any) => (
                <DropdownMenuItem key={child.href} asChild>
                  {/* Subtle hover background transition with Teal Glow text */}
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
            // Base link styles matching the glow effect on interaction
            className="transition-colors duration-200 hover:text-[#7DDDD5]"
          >
            {item.label}
          </Link>
        )
      )}
    </nav>
  );
}