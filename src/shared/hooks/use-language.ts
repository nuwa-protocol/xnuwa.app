import { SettingsStateStore } from '@/features/settings/stores';
import { getLocaleText } from '@/shared/locales';

// Language settings hook for unified language access
export const useLanguage = () => {
  const { settings } = SettingsStateStore();
  const language = settings.language || 'en';
  const { t } = getLocaleText(language);

  return {
    language,
    t,
  };
};
