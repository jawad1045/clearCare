"use client";

import * as React from "react";
import { translate, type TranslationKey } from "./config";
import { useLocale } from "./locale-provider";

export type { TranslationKey };

export function useTranslation() {
  const { locale } = useLocale();

  const t = React.useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale]
  );

  return { t, locale };
}
