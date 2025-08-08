import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Transaction } from './types';

interface WalletState {
  // Wallets
  balance: number;
  transactions: Transaction[];

  setBalance: (balance: number) => void;
  addTransaction: (transaction: Transaction) => void;
}

export const WalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      balance: 0,
      transactions: [],

      setBalance: (balance) => {
        set({ balance });
      },

      addTransaction: (transaction) => {
        set((state) => ({
          transactions: [...state.transactions, transaction],
        }));
      },
    }),
    {
      name: 'wallet-storage',
      // Only persist the balance, not the transactions
      partialize: (state) => ({
        balance: state.balance,
        transactions: state.transactions,
      }),
    },
  ),
);
