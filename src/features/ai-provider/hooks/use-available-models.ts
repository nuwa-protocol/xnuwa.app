import { useCallback, useEffect, useState } from 'react';
import { getAvailableModels } from '../services/models';
import type { Model } from '../types';

let cachedModels: Model[] | null = null;
let isLoading = false;
let loadingPromise: Promise<Model[]> | null = null;

export function useAvailableModels() {
  const [models, setModels] = useState<Model[] | null>(cachedModels);
  const [loading, setLoading] = useState<boolean>(cachedModels === null);
  const [error, setError] = useState<Error | null>(null);

  const fetchModels = useCallback(async () => {
    if (cachedModels) {
      setModels(cachedModels);
      setLoading(false);
      return;
    }

    if (isLoading && loadingPromise) {
      try {
        const data = await loadingPromise;
        setModels(data);
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);
    isLoading = true;

    try {
      loadingPromise = getAvailableModels();
      const data = await loadingPromise;
      cachedModels = data;
      setModels(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
      isLoading = false;
      loadingPromise = null;
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return {
    models,
    loading,
    error,
    reload: fetchModels,
  };
}
