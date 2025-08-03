import { WalletStore } from '../stores';
import type { Transaction } from '../types';

export const useWallet = () => {
  const balance = WalletStore.getState().balance;
  const transactions = WalletStore.getState().transactions;

  const addTransaction = (transaction: Transaction) => {
    WalletStore.getState().addTransaction(transaction);
  };

  const setBalance = (balance: number) => {
    WalletStore.getState().setBalance(balance);
  };

  return { balance, transactions, addTransaction, setBalance };
};
