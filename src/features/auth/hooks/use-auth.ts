'use client';

import {
  type UseIdentityKitOptions,
  useNuwaIdentityKit,
} from '@nuwa-ai/identity-kit-web';

export const useAuth = (options: UseIdentityKitOptions = {}) => {
  const { state } = useNuwaIdentityKit({
    appName: 'Nuwa Assistant',
    cadopDomain:
      typeof window !== 'undefined'
        ? (localStorage.getItem('cadop-domain') ?? 'https://test-id.nuwa.dev')
        : 'https://test-id.nuwa.dev',
    storage: 'local',
    autoConnect: false,
    ...options,
  });

  return {
    did: state.agentDid,
    isConnecting: state.isConnecting,
    isConnected: state.isConnected,
    isError: state.error,
  };
};
