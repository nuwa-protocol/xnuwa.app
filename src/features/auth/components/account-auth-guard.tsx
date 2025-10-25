import { createContext, type ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthRehydration } from '@/shared/hooks';
import { AccountStore } from '../store';

type WalletAuthGuardValue = ReturnType<typeof AccountStore>;

const WalletAuthGuardContext = createContext<WalletAuthGuardValue | null>(null);

export function AccountAuthGuard({ children }: { children: ReactNode }) {
  const { account } = AccountStore();
  const isAuthRehydrated = useAuthRehydration();

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthRehydrated && !account) {
      navigate('/login');
    }
  }, [account, isAuthRehydrated]);

  return (
    <WalletAuthGuardContext.Provider
      value={{
        account,
      }}
    >
      {children}
    </WalletAuthGuardContext.Provider>
  );
}
