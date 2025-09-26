import { useEffect, useState } from 'react';
import { useAuth } from '@/shared/hooks/use-auth';
import {
  checkPaymentStatus,
  createPayment,
} from '../services/deposit-transactions';
import type {
  CreatePaymentOrderRequest,
  CreatePaymentOrderResponse,
  Currency,
  PaymentOrder,
} from '../types/deposit-transactions';

const calculateTimeLeft = (estimatedExpirationDate: string) => {
  const expirationTime = new Date(estimatedExpirationDate).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((expirationTime - now) / 1000));
};

const normalizeStatus = (status: string) => {
  switch (status.toLowerCase()) {
    case 'waiting':
      return 'waiting';
    case 'confirming':
      return 'confirming';
    case 'confirmed':
      return 'completed';
    case 'sending':
      return 'completed';
    case 'finished':
      return 'completed';
    case 'expired':
      return 'expired';
    case 'partially_paid':
      return 'partially_paid';
  }
  return status;
};

const mapCreatePaymentResponseToPaymentOrder = (
  response: CreatePaymentOrderResponse,
): PaymentOrder => {
  return {
    paymentId: response.payment_id,
    status: response.payment_status,
    paymentAddress: response.pay_address,
    paymentCurrency: response.pay_currency,
    paymentNetwork: response.network,
    expirationTime: response.expiration_estimate_date,
    totalDue: response.pay_amount,
    received: response.amount_received,
    network: response.network,
    purchasedAmount: response.price_amount,
    orderId: response.order_id,
    createdAt: response.created_at,
    updatedAt: response.updated_at,
  };
};

export const useDepositPayment = (amount: number, currency: Currency) => {
  const { did: userDid } = useAuth();
  const [payment, setPayment] = useState<PaymentOrder | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const createPaymentOrder = async () => {
    if (isCreating || payment || !userDid) {
      return;
    }

    setIsCreating(true);
    setError(null);
    try {
      const paymentRequest: CreatePaymentOrderRequest = {
        price_amount: amount,
        price_currency: 'USD',
        order_id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        order_description: `Buy ${amount} USD credits`,
        pay_currency: currency.code,
        payer_did: userDid,
      };

      const paymentResponse = await createPayment(paymentRequest);

      if (paymentResponse) {
        setPayment(mapCreatePaymentResponseToPaymentOrder(paymentResponse));
        // Calculate initial time left
        setTimeLeft(
          calculateTimeLeft(paymentResponse.expiration_estimate_date),
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create payment order',
      );
      console.error('Payment creation failed:', err);
    } finally {
      setIsCreating(false);
    }
  };

  // Create payment order on mount
  useEffect(() => {
    createPaymentOrder();
  }, [userDid, isCreating, payment]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const retryCreate = () => {
    setError(null);
    setPayment(null);
    setTimeLeft(0);
    createPaymentOrder();
  };

  const checkStatus = async () => {
    if (!payment?.paymentId) {
      console.error('No payment ID available for status check');
      return;
    }

    setIsCheckingStatus(true);

    try {
      const updatedPayment = await checkPaymentStatus(payment.paymentId);

      if (updatedPayment) {
        setPayment({
          ...payment,
          status: normalizeStatus(updatedPayment.payment_status),
          received: updatedPayment.outcome_amount,
        });
      } else {
        console.error('No payment data received from status check');
      }
    } catch (err) {
      console.error('Payment status check failed:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to refresh payment status';
      console.error(`Error: ${errorMessage}`);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  return {
    payment,
    isCreating,
    isCheckingStatus,
    timeLeft,
    error,
    retryCreate,
    checkStatus,
  };
};
