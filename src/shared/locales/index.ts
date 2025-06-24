import { cn } from "./cn";
import { en } from "./en";

export const locales = { en, cn };
export type Locale = keyof typeof locales;

export function getLocale(locale: Locale) {
  return locales[locale] || en;
}

export { getLocaleText } from "./use-locale";
