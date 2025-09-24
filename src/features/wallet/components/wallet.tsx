import { useState } from 'react';
import { BalanceCard } from './balance-card';
import { NowPaymentsTopupModal } from './buy-modal';
import { Transactions } from './transactions';

export function Wallet() {
  const [showNowPaymentsModal, setShowNowPaymentsModal] = useState(false);

  return (
    <div className="container mx-auto max-w-2xl p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Wallet</h1>
        <p className="text-muted-foreground">
          Check your balance and transaction history
        </p>
      </div>

      <BalanceCard onBuy={() => setShowNowPaymentsModal(true)} />

      <Transactions />

      <NowPaymentsTopupModal
        open={showNowPaymentsModal}
        onOpenChange={setShowNowPaymentsModal}
      />
    </div>
  );
}
