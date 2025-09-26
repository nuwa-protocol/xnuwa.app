import { useState } from 'react';
import { fetchDepositOrder } from '../services/deposit';
import type { DepositOrder } from '../types/deposit';
import { mapFetchDepositOrderResponseToPaymentOrder } from '../utils';

export const useDepositOrderById = (orderPaymentId: string) => {
  const [order, setOrder] = useState<DepositOrder | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const updateOrder = async () => {
    setIsUpdating(true);
    try {
      const response = await fetchDepositOrder(orderPaymentId);

      if (response) {
        setOrder(mapFetchDepositOrderResponseToPaymentOrder(response));
      } else {
        console.error('No payment data received from status check');
        setUpdateError('No payment data received from status check');
      }
    } catch (err) {
      console.error('Payment status check failed:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to refresh payment status';
      console.error(`Error: ${errorMessage}`);
      setUpdateError(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    order,
    isUpdating,
    updateError,
    updateOrder,
  };
};
