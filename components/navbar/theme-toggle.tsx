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
import { useTranslation } from "@/locale/use-translation";

const THEME_OPTIONS = [
  { value: "light", labelKey: "themeToggle.light", icon: Sun },
  { value: "dark", labelKey: "themeToggle.dark", icon: Moon },
  { value: "system", labelKey: "themeToggle.system", icon: Monitor },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const ActiveIcon = THEME_OPTIONS.find((opt) => opt.value === theme)?.icon ?? Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("themeToggle.switchTheme")}
        className="p-2 rounded-full text-sidebar-foreground hover:bg-slate-800 hover:text-sidebar-accent-foreground transition-colors duration-200 focus:outline-none"
      >
        <ActiveIcon className="h-4 w-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="bg-slate-950 border border-slate-800 min-w-40">
        {THEME_OPTIONS.map(({ value, labelKey, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className="flex items-center gap-2 text-slate-100"
          >
            <Icon className="h-4 w-4" />
            {t(labelKey)}
            {theme === value && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
