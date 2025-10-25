import { createContext, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthRehydration } from '@/shared/hooks';
import { AccountStore } from '../store';

type AuthGuardValue = ReturnType<typeof AccountStore>;

const AuthGuardContext = createContext<AuthGuardValue | null>(null);

export function AuthGuard({ children }: { children: ReactNode }) {
  const { account } = AccountStore();
  const isAuthRehydrated = useAuthRehydration();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthRehydrated) return;
    if (account) return;
    navigate('/', { replace: true });
  }, [account, isAuthRehydrated, navigate]);

  return (
    <AuthGuardContext.Provider
      value={{
        account,
      }}
    >
      {children}
    </AuthGuardContext.Provider>
  );
}
