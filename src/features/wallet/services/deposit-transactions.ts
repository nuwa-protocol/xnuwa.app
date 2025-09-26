import { getConfig } from '@/shared/config/nowpayments';
import type {
  CheckPaymentStatusResponse,
  CreatePaymentOrderRequest,
  CreatePaymentOrderResponse,
  DepositTransactionFilter,
  DepositTransactionsResponse,
  GetMinAmountResponse,
} from '../types/deposit-transactions';
import { normalizeCurrencies } from '../utils';

export const fetchDepositTransactions = async (
  did: string,
  filters: DepositTransactionFilter = {},
): Promise<DepositTransactionsResponse | null> => {
  try {
    const config = getConfig();
    const { status = [], limit = 50, offset = 0 } = filters;

    const params = new URLSearchParams();
    if (status.length > 0) {
      params.append('status', status.join(','));
    }
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const apiUrl = `${config.appUrl}/api/users/${did}/orders?${params.toString()}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error('Failed to fetch deposit transactions');
    }

    const data: DepositTransactionsResponse = await response.json();
    return data;
  } catch (err) {
    console.error('Get user orders error:', err);
    throw err;
  }
};
export const createPayment = async (
  request: CreatePaymentOrderRequest,
): Promise<CreatePaymentOrderResponse | null> => {
  try {
    const config = getConfig();

    const apiUrl = `${config.appUrl}/api/payment`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Create payment failed:', errorData);
      throw new Error(errorData.message || 'Create payment failed');
    }

    const paymentData: CreatePaymentOrderResponse = await response.json();
    return paymentData;
  } catch (err) {
    console.error('NowPayments payment creation error:', err);
    throw err;
  }
};

export const checkPaymentStatus = async (
  paymentId: string,
): Promise<CheckPaymentStatusResponse | null> => {
  try {
    const config = getConfig();
    const apiUrl = `${config.appUrl}/api/payments/${paymentId}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error('Check payment status failed');
      throw new Error('Check payment status failed');
    }

    const statusData: CheckPaymentStatusResponse = await response.json();

    return statusData;
  } catch (err) {
    console.error('Payment status check error:', err);
    throw err;
  }
};

export const getSupportedCurrencies = async () => {
  const config = getConfig();

  try {
    const response = await fetch(`${config.appUrl}/api/full-currencies`);

    if (!response.ok) {
      throw new Error('Failed to fetch supported cryptocurrencies');
    }

    const data = await response.json();

    if (!data.currencies || !Array.isArray(data.currencies)) {
      throw new Error('API returned data format error');
    }

    return normalizeCurrencies(data.currencies);
  } catch (err) {
    console.error('Failed to fetch available cryptocurrencies:', err);
    throw err;
  }
};

export const getExchangeRate = async (
  currency: string,
): Promise<number | null> => {
  try {
    const config = getConfig();
    const apiUrl = `${config.appUrl}/api/estimate?amount=1&from=usd&to=${currency}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error('Get exchange rate error:');
      throw new Error('Failed to get exchange rate');
    }

    const data = await response.json();

    // ensure the return is a number
    const estimatedAmount = data.estimated_amount;
    if (estimatedAmount === null || estimatedAmount === undefined) {
      return null;
    }

    const numericAmount = Number(estimatedAmount);
    return isNaN(numericAmount) ? null : numericAmount;
  } catch (err) {
    console.error('Get exchange rate error:', err);
    throw err;
  }
};

export const getMinAmount = async (
  fromCurrency: string,
  toCurrency: string = 'USD',
): Promise<number | null> => {
  try {
    const config = getConfig();
    const apiUrl = `${config.appUrl}/api/min-amount?from=${fromCurrency}&to=${toCurrency}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error('Get min amount error:');
      throw new Error('Failed to get min amount');
    }

    const data: GetMinAmountResponse = await response.json();

    return data.min_amount;
  } catch (err) {
    console.error('Get min amount error:', err);
    throw err;
  }
};
