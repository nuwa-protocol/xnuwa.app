import { CapKit } from '@nuwa-ai/cap-kit';
import { useCallback, useState } from 'react';
import { NuwaIdentityKit } from '../services/identity-kit';

export const useCapKitInit = () => {
  const [capKit, setCapKit] = useState<CapKit | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const initializeCapKit = useCallback(async () => {
    if (capKit || isInitializing) return capKit;

    const keyManager = await NuwaIdentityKit().getKeyManager();

    setIsInitializing(true);
    try {
      const newCapKit = new CapKit({
        roochUrl: 'https://test-seed.rooch.network',
        mcpUrl: 'https://nuwa-production-a276.up.railway.app',
        contractAddress:
          '0xdc2a3eba923548660bb642b9df42936941a03e2d8bab223ae6dda6318716e742',
        signer: keyManager,
      });

      setCapKit(newCapKit);
      return newCapKit;
    } catch (error) {
      console.error('Failed to initialize CapKit:', error);
      throw error;
    } finally {
      setIsInitializing(false);
    }
  }, [capKit, isInitializing]);

  return {
    capKit,
    isInitializing,
    initializeCapKit,
  };
};
