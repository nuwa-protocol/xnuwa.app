import { Coins } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useDepositOrder } from '../../../hooks/use-deposit-order';
import type { Currency } from '../../../types/deposit';
import { OrderCompleted } from './order-completed';
import { OrderCreating } from './order-creating';
import { OrderCreation } from './order-creation';
import { OrderCreationError } from './order-creation-error';
import { OrderExpired } from './order-expired';
import { OrderPending } from './order-pending';

const POLLING_INTERVAL = 3000;

// Step 2: Create payment order and show payment details
export function BuyCreditsView() {
  const [amount, setAmount] = useState<number | null>(null);
  const [currency, setCurrency] = useState<Currency | null>(null);
  const {
    order,
    isCreating,
    isUpdating,
    createError,
    updateError,
    createOrder,
    updateOrder,
  } = useDepositOrder();

  const handleBuyComplete = async (amount: number, currency: Currency) => {
    setAmount(amount);
    setCurrency(currency);
    await createOrder(amount, currency);
  };

  const retryCreate = () => {
    if (amount && currency) {
      createOrder(amount, currency);
    }
  };

  useEffect(() => {
    if (!order) return;

    if (order.status === 'pending') {
      const interval = setInterval(() => {
        updateOrder();
      }, POLLING_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [order]);


  if (createError) {
    return (
      <OrderCreationError
        error={createError}
        retryCreate={retryCreate}
        isCreating={isCreating}
      />
    );
  }

  if (order) {
    if (order.status === 'completed') {
      return <OrderCompleted order={order} />;
    }

    if (order.status === 'expired') {
      return <OrderExpired order={order} onRetry={retryCreate} />;
    }
    return (
      <OrderPending
        order={order}
        isOrderUpdating={isUpdating}
        updateOrder={updateOrder}
      />
    );
  }

  if (!order && isCreating) {
    return <OrderCreating />;
  }

  return <OrderCreation onComplete={handleBuyComplete} />;
}

export type BuyCreditsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BuyCreditsModal(props: BuyCreditsModalProps) {
  const { open, onOpenChange } = props;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" /> Buy Nuwa Credits
          </DialogTitle>
        </DialogHeader>
        <BuyCreditsView />
      </DialogContent>
    </Dialog>
  );
}
