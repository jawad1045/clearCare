"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { LocaleProvider } from "@/locale/locale-provider";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <LocaleProvider>{children}</LocaleProvider>
    </NextThemesProvider>
  );
}
