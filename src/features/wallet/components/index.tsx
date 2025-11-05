import { BalanceCard } from './balance-payments/balance-card';
import { TransactionsCard } from './transactions';

export function Wallet() {
  return (
    <div className="container mx-auto max-w-2xl p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Wallet (X Layer Testnet)</h1>
        <p className="text-muted-foreground">
          Check your balance and transaction history
        </p>
      </div>

      <BalanceCard />

      <TransactionsCard />

    </div>
  );
}
