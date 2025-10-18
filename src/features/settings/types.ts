import type { Locale } from '@/shared/locales';

export type UserSettings = {
  language: Locale;
  name: string;
  avatar: string | null;
  devMode: boolean;
};
