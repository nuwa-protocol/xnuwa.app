import { useCallback } from 'react';
import { SettingsStateStore } from '@/features/settings/stores';

// User settings hook
export const useSettings = () => {
  const store = SettingsStateStore();

  const setSetting = useCallback(
    <K extends keyof typeof store.settings>(
      key: K,
      value: (typeof store.settings)[K],
    ) => {
      store.setSetting(key, value);
    },
    [],
  );

  const setSettings = useCallback((settings: typeof store.settings) => {
    store.setSettings(settings);
  }, []);

  return {
    settings: store.settings,
    setSetting,
    setSettings,
    resetSettings: store.resetSettings,
  };
};
