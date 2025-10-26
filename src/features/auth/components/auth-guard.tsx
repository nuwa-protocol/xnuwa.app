import { createContext, type ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthRehydration } from '@/shared/hooks';
import { AccountStore } from '../store';

type AuthGuardValue = ReturnType<typeof AccountStore>;

const AuthGuardContext = createContext<AuthGuardValue | null>(null);

export function AuthGuard({ children }: { children: ReactNode }) {
  const { account } = AccountStore();
  const isAuthRehydrated = useAuthRehydration();
  const navigate = useNavigate();

  console.log('account', account);

  useEffect(() => {
    if (!isAuthRehydrated) return;
    if (account) return;
    // When not authenticated, route to the landing at '/'
    navigate('/', { replace: true });
  }, [account, isAuthRehydrated, navigate]);

  // Avoid rendering protected children while redirecting to prevent runtime errors
  if (isAuthRehydrated && !account) {
    return null;
  }

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
