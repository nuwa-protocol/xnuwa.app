import { useRef, useState } from 'react';
import {
  fetchDepositOrder,
  getPaymentEstimatedAmount,
} from '../services/deposit';
import type { DepositOrder } from '../types/deposit';
import {
  calculateTimeLeft,
  mapFetchDepositOrderResponseToPaymentOrder,
} from '../utils';

export const useDepositOrderById = () => {
  const [order, setOrder] = useState<DepositOrder | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  // Use a ref as a synchronous lock to prevent re-entrant calls within the same render tick.
  // isUpdating (state) updates on the next render, so multiple calls in the same tick would all
  // see the stale `false` value. The ref avoids that race and still lets us show UI loading state.
  const updatingRef = useRef(false);

  const updateOrder = async (
    orderPaymentId: string,
    options?: { force?: boolean },
  ) => {
    // Guard against duplicate/concurrent invocations
    if (updatingRef.current) return;
    // If the same order is already loaded and this is not an explicit refresh, skip.
    // This keeps the initial effect idempotent (and helps with React 18 StrictMode double-invoke).
    if (!options?.force && order && order.paymentId === orderPaymentId) return;

    updatingRef.current = true;
    setIsUpdating(true);
    try {
      const response = await fetchDepositOrder(orderPaymentId);

      if (response) {
        const newOrder = mapFetchDepositOrderResponseToPaymentOrder(response);

        const timeLeft = calculateTimeLeft(newOrder.expirationTime);

        // if the order is expired, update the estimated amount
        if (timeLeft <= 0) {
          const newEstimate = await getPaymentEstimatedAmount(orderPaymentId);
          if (newEstimate) {
            setOrder({
              ...newOrder,
              totalDue: newEstimate.totalDue,
              expirationTime: newEstimate.expirationTime,
            });
          }
        } else {
          setOrder(newOrder);
        }
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
      updatingRef.current = false;
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
