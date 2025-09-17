import { createContext, type ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/use-auth';

type AuthGuardValue = ReturnType<typeof useAuth>;

const AuthGuardContext = createContext<AuthGuardValue | null>(null);

export function AuthGuard({ children }: { children: ReactNode }) {
  const { did, isConnecting, isConnected, isError, isInitializing } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    // Avoid redirect until SDK initialization completes
    if (isInitializing) {
      return;
    }

    if (!isConnecting && !isConnected) {
      navigate('/login');
    }
  }, [isInitializing, isConnecting, isConnected, navigate]);

  return (
    <AuthGuardContext.Provider
      value={{
        did,
        isConnecting,
        isConnected,
        isError,
        isInitializing,
      }}
    >
      {children}
    </AuthGuardContext.Provider>
  );
}
