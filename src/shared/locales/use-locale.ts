'use client';

import { useMemo } from 'react';
import { SettingsStateStore } from '@/features/settings/stores';
import { getLocale, type Locale } from './index';

// non-hook version, can be used anywhere
export function getLocaleText(language: Locale = 'en') {
  const localeObj = getLocale(language);

  function t<T = any>(path: string, vars?: Record<string, any>): T {
    const keys = path.split('.');
    let value: any = localeObj;
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) return path as any;
    }
    if (typeof value === 'string' && vars) {
      return value.replace(
        /\{\{(.*?)\}\}/g,
        (_, k) => vars[k.trim()] ?? '',
      ) as any;
    }
    return value;
  }

  return { locale: language, t, raw: localeObj };
}

// React hook version, for components
export function useLocale() {
  const language = SettingsStateStore((s) => s.settings.language) as Locale;
  const localeObj = useMemo(() => getLocale(language), [language]);

  // type-safe t method
  function t<T = any>(path: string, vars?: Record<string, any>): T {
    const keys = path.split('.');
    let value: any = localeObj;
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) return path as any;
    }
    if (typeof value === 'string' && vars) {
      return value.replace(
        /\{\{(.*?)\}\}/g,
        (_, k) => vars[k.trim()] ?? '',
      ) as any;
    }
    return value;
  }

  return { locale: language, t, raw: localeObj };
}
