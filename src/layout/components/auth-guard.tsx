'use client';

import { createContext, useEffect, type ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

type AuthGuardValue = ReturnType<typeof useAuth>;

const AuthGuardContext = createContext<AuthGuardValue | null>(null);

export function AuthGuard({ children }: { children: ReactNode }) {
  const { did, isConnecting, isConnected, isError } = useAuth();

  const router = useRouter();
  // Keep legacy DID store in sync so existing code relying on it continues to work.
  useEffect(() => {
    if (!isConnected) {
      router.push('/login');
    }
  }, [isConnected, router]);

  return (
    <AuthGuardContext.Provider
      value={{
        did,
        isConnecting,
        isConnected,
        isError,
      }}
    >
      {children}
    </AuthGuardContext.Provider>
  );
}
