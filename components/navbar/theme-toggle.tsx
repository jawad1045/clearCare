// components/navbar/theme-toggle.tsx

"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const ActiveIcon = THEME_OPTIONS.find((t) => t.value === theme)?.icon ?? Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Switch theme"
        className="p-2 rounded-full text-sidebar-foreground hover:bg-slate-800 hover:text-sidebar-accent-foreground transition-colors duration-200 focus:outline-none"
      >
        <ActiveIcon className="h-4 w-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="bg-slate-950 border border-slate-800 min-w-40">
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className="flex items-center gap-2 text-slate-100"
          >
            <Icon className="h-4 w-4" />
            {label}
            {theme === value && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
