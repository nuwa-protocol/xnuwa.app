import {
  type UseIdentityKitOptions,
  useIdentityKit,
} from '@nuwa-ai/identity-kit-web';
import { useEffect, useState } from 'react';
import { cadopConfig } from '../config/cadop';
import { NuwaIdentityKit } from '../services/identity-kit';

export const useAuth = (options: UseIdentityKitOptions = {}) => {
  const { state, sdk } = useIdentityKit({
    ...cadopConfig,
    ...options,
  });
  const { isConnected } = NuwaIdentityKit();
  const [isKitConnected, setIsKitConnected] = useState(false);

  useEffect(() => {
    const checkKitConnection = async () => {
      if (await isConnected) {
        setIsKitConnected(true);
      }
    };
    checkKitConnection();
  }, [isConnected]);

  return {
    did: state.agentDid,
    isConnecting: state.isConnecting,
    isConnected: isKitConnected,
    isError: state.error,
    isInitializing: sdk === null,
  };
};
