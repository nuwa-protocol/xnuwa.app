import { useCallback } from 'react';
import { ModelStateStore } from '../stores';

export const useWebSearch = () => {
  const webSearchEnabled = ModelStateStore((state) => state.webSearchEnabled);
  const setWebSearchEnabled = ModelStateStore(
    (state) => state.setWebSearchEnabled,
  );
  const webSearchContextSize = ModelStateStore(
    (state) => state.webSearchContextSize,
  );
  const setWebSearchContextSize = ModelStateStore(
    (state) => state.setWebSearchContextSize,
  );

  const toggleWebSearch = useCallback(() => {
    setWebSearchEnabled(!webSearchEnabled);
  }, [webSearchEnabled, setWebSearchEnabled]);

  return {
    webSearchEnabled,
    setWebSearchEnabled,
    toggleWebSearch,
    webSearchContextSize,
    setWebSearchContextSize,
  };
};
