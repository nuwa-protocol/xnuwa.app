import {
  type UseIdentityKitOptions,
  useIdentityKit,
} from '@nuwa-ai/identity-kit-web';
import { cadopConfig } from '../config/cadop';
import { NuwaIdentityKit } from '../services/identity-kit';

export const useAuth = (options: UseIdentityKitOptions = {}) => {
  const { state, sdk } = useIdentityKit({
    ...cadopConfig,
    ...options,
  });

  const { isConnected } = NuwaIdentityKit();

  return {
    did: state.agentDid,
    isConnecting: state.isConnecting,
    isConnected: isConnected,
    isError: state.error,
    isInitializing: sdk === null,
  };
};
