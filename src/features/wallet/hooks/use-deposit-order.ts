import { useState } from 'react';
import { useAuth } from '@/shared/hooks/use-auth';
import {
  createDepositOrder,
  fetchDepositOrder,
  getPaymentEstimatedAmount,
} from '../services/deposit';
import type {
  CreateDepositOrderRequest,
  Currency,
  DepositOrder,
} from '../types/deposit';
import {
  mapCreatePaymentResponseToPaymentOrder,
  mapFetchDepositOrderResponseToPaymentOrder,
} from '../utils';

export const useDepositOrder = () => {
  const { did: userDid } = useAuth();
  const [order, setOrder] = useState<DepositOrder | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const createOrder = async (amount: number, currency: Currency) => {
    if (isCreating || order || !userDid) {
      return;
    }

    setIsCreating(true);
    setCreateError(null);
    setOrder(null);
    try {
      const request: CreateDepositOrderRequest = {
        price_amount: amount,
        price_currency: 'USD',
        order_id: `order_${userDid}_${amount}_${Date.now()}`,
        order_description: `$${amount} USD of xNUWA credits`,
        pay_currency: currency.code.toLowerCase(),
        payer_did: userDid,
      };

      const response = await createDepositOrder(request);

      if (response) {
        setOrder(mapCreatePaymentResponseToPaymentOrder(response));
      }
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : 'Failed to create payment order',
      );
      console.error('Payment creation failed:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const updateOrder = async () => {
    if (!order) {
      console.error('No payment ID available for status check');
      return;
    }

    setIsUpdating(true);
    try {
      const paymentStatus = await fetchDepositOrder(order.paymentId);
      if (paymentStatus) {
        // if the order is not expired, update the estimated amount
        if (order.expirationTime > new Date().toISOString()) {
          const newEstimate = await getPaymentEstimatedAmount(order.paymentId);
          if (newEstimate) {
            setOrder({
              ...mapFetchDepositOrderResponseToPaymentOrder(paymentStatus),
              totalDue: newEstimate.totalDue,
              expirationTime: newEstimate.expirationTime,
            });
          }
        } else {
          setOrder(mapFetchDepositOrderResponseToPaymentOrder(paymentStatus));
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
      setIsUpdating(false);
    }
  };

  return {
    order,
    isCreating,
    isUpdating,
    createError,
    updateError,
    createOrder,
    updateOrder,
  };
};
