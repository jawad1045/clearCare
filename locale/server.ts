import "server-only";
import { cookies } from "next/headers";
import { locales, translate, type Locale, type TranslationKey } from "./config";

const LOCALE_COOKIE_NAME = "locale";

export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE_NAME)?.value;
  return (locales as readonly string[]).includes(value ?? "") ? (value as Locale) : "en";
}

export async function getServerTranslation() {
  const locale = await getServerLocale();
  const t = (key: TranslationKey, vars?: Record<string, string | number>) => translate(locale, key, vars);
  return { t, locale };
}
