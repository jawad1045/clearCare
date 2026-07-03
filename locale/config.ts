import en from "@/messages/en.json";
import es from "@/messages/es.json";

export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  en: "English",
  es: "Español",
};

// JSON imports infer string-literal types per key; widen them back to `string`
// so `en` and `es` (whose values differ) both satisfy the same `Messages` shape.
type Widen<T> = T extends string ? string : { [K in keyof T]: Widen<T[K]> };
export type Messages = Widen<typeof en>;

export const messages: Record<Locale, Messages> = { en, es };

type DotPath<T> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string ? K : `${K}.${DotPath<T[K]>}`;
    }[keyof T & string];

export type TranslationKey = DotPath<Messages>;

export function resolveMessage(dict: unknown, path: string): string | undefined {
  return path.split(".").reduce<any>((acc, key) => acc?.[key], dict);
}

export function translate(
  locale: Locale,
  key: TranslationKey,
  vars?: Record<string, string | number>
) {
  const raw = resolveMessage(messages[locale], key) ?? resolveMessage(messages.en, key) ?? key;
  if (!vars) return raw;
  return Object.entries(vars).reduce(
    (str, [name, value]) => str.replaceAll(`{${name}}`, String(value)),
    raw
  );
}
