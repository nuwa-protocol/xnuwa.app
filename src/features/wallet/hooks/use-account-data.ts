import useSWR from 'swr';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  accountApi,
  type BalanceData,
  type Transaction,
} from '../services/account-api';

export function useAccountData() {
  const { isConnected } = useAuth();

  const {
    data: balance,
    error: balanceError,
    isLoading: balanceLoading,
    mutate: refreshBalance,
  } = useSWR<BalanceData>(
    isConnected ? 'account/balance' : null,
    accountApi.getBalance,
  );

  const {
    data: transactions,
    error: transactionsError,
    isLoading: transactionsLoading,
    mutate: refreshTransactions,
  } = useSWR<Transaction[]>(
    isConnected ? 'account/transactions' : null,
    accountApi.getTransactions,
  );

  const refreshAll = () => {
    refreshBalance();
    refreshTransactions();
  };

  return {
    balance: balance || { nuwaTokens: 0, usdRate: 0.02 },
    transactions: transactions || [],
    isLoading: (balanceLoading || transactionsLoading) && isConnected,
    error: balanceError || transactionsError,
    refreshBalance,
    refreshTransactions,
    refreshAll,
    isAuthenticated: isConnected,
  };
}
