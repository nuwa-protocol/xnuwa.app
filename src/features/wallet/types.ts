export type Network = 'ethereum' | 'arbitrum' | 'base' | 'polygon' | 'bsc';

export type Asset = 'usdt' | 'usdc';

type TransactionStatus = 'confirming' | 'completed';

interface DepositTransaction {
  id: string;
  type: 'deposit';
  label: string;
  timestamp: number;
  amount: number;
  status: TransactionStatus;
}

interface SpendTransaction {
  id: string;
  type: 'spend';
  label: string;
  timestamp: number;
  amount: number;
  chatid: string;
  capid: string;
  status: TransactionStatus;
}

export type Transaction = DepositTransaction | SpendTransaction;
