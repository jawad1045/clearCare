// components/navbar/language-toggle.tsx

"use client";

import { Languages, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useLocale } from "@/locale/locale-provider";
import { useTranslation } from "@/locale/use-translation";
import { locales, localeLabels } from "@/locale/config";

export function LanguageToggle() {
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("languageToggle.switchLanguage")}
        className="p-2 rounded-full text-sidebar-foreground hover:bg-slate-800 hover:text-sidebar-accent-foreground transition-colors duration-200 focus:outline-none"
      >
        <Languages className="h-4 w-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="bg-slate-950 border border-slate-800 min-w-40">
        {locales.map((value) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setLocale(value)}
            className="flex items-center gap-2 text-slate-100"
          >
            {localeLabels[value]}
            {locale === value && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
