import type { CapKit } from '@nuwa-ai/cap-kit';
import { useEffect, useState } from 'react';
import { capKitService } from '../services/capkit-service';

export const useCapKit = () => {
  const [capKit, setCapKit] = useState<CapKit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeCapKit = async () => {
      try {
        const capKitInstance = await capKitService.getCapKit();
        setCapKit(capKitInstance);
      } catch (err) {
        setError(err as Error);
        console.error('Failed to initialize CapKit:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeCapKit();
  }, []);

  return {
    capKit,
    isLoading,
    error,
  };
};
