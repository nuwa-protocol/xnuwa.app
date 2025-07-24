'use client';

import { useSettings } from '@/features/settings/hooks/use-settings';
import { getLocaleText } from '@/shared/locales';

// Language settings hook for unified language access
export const useLanguage = () => {
  const { settings } = useSettings();
  const language = settings.language || 'en';
  const { t } = getLocaleText(language);

  return {
    language,
    t,
  };
};
