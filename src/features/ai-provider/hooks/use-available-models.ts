import { useEffect } from 'react';
import { ModelStateStore } from '../stores';

export function useAvailableModels() {
  const models = ModelStateStore((state) => state.availableModels);
  const loading = ModelStateStore((state) => state.isLoadingModels);
  const error = ModelStateStore((state) => state.modelsError);
  const fetchAvailableModels = ModelStateStore(
    (state) => state.fetchAvailableModels,
  );
  const reloadModels = ModelStateStore((state) => state.reloadModels);

  useEffect(() => {
    fetchAvailableModels();
  }, [fetchAvailableModels]);

  return {
    models,
    loading,
    error,
    reload: reloadModels,
  };
}
