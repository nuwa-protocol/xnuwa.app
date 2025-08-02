import { useState } from 'react';
import { BalanceCard } from './balance-card';
import { TopUpModal } from './top-up-modal';
import { TransactionHistory } from './transaction-history';

export function Account() {
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showUSD, setshowUSD] = useState(false);

  return (
    <div className="container mx-auto max-w-2xl p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Account</h1>
        <p className="text-muted-foreground">
          Manage your credits and view transaction history
        </p>
      </div>

      <BalanceCard
        onTopUp={() => setShowTopUpModal(true)}
        showUSD={showUSD}
        onToggleUSD={setshowUSD}
      />

      <TransactionHistory showUSD={showUSD} />

      <TopUpModal open={showTopUpModal} onOpenChange={setShowTopUpModal} />
    </div>
  );
}
