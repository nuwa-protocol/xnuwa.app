import { formatAmount } from '@nuwa-ai/payment-kit';
import { baseQuickAmounts } from './constants';
import type {
  CreateDepositOrderResponse,
  Currency,
  DepositOrder,
  DepositOrderStatus,
  FetchDepositOrderResponse,
  FetchDepositOrdersResponseItem,
} from './types';

export const formatUsdCost = (cost: bigint | undefined) => {
  if (!cost) return undefined;
  if (typeof cost === 'bigint') return `$${formatAmount(cost, 12)}`;
  if (cost !== undefined && cost !== null) {
    return `$${formatAmount(BigInt(String(cost)), 12)}`;
  }
  return undefined;
};

export const QuickAmounts = (minAmount: number | null) => {
  const base = baseQuickAmounts;

  if (!minAmount) return base;

  if (!minAmount || minAmount <= 0) {
    return base;
  }

  // Find the first number greater than or equal to minAmount
  const minCeil = Math.ceil(minAmount);
  const validBase = base.filter((amount) => amount >= minCeil);

  // If all base numbers are less than minAmount, generate new even numbers
  if (validBase.length === 0) {
    // Generate 6 evenly spaced numbers starting from minAmount
    const start = Math.ceil(minCeil / 10) * 10; // Round up to the nearest 10
    return Array.from({ length: 6 }, (_, i) => start + i * 10);
  }

  // If there are less than 6 valid numbers, add more evenly spaced numbers
  if (validBase.length < 6) {
    const maxValid = Math.max(...validBase);
    const additional = [];
    let next = maxValid + 10;

    while (validBase.length + additional.length < 6) {
      additional.push(next);
      next += 10;
    }

    return [...validBase, ...additional];
  }

  // If there are more than 6 valid numbers, return the first 6
  return validBase.slice(0, 6);
};

// Generate icon URL
const normalizeLogoUrl = (logoUrl: string): string => {
  if (logoUrl) {
    // If logoUrl is already a full URL, return it directly
    if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
      return logoUrl;
    }
    // Otherwise, concatenate nowpayments.io domain name
    return `https://nowpayments.io${logoUrl}`;
  }
  return '';
};

// API data processing function
export const normalizeCurrencies = (currencies: Currency[]): Currency[] => {
  return currencies
    .filter((currency) => currency.enable) // filter enabled currencies
    .sort((a, b) => b.priority - a.priority) // sort by priority
    .map((currency) => ({
      ...currency,
      logo_url: normalizeLogoUrl(currency.logo_url), // normalize logo url
    }));
};

export const formatSmallNumber = (num: number): string => {
  if (num >= 1) return num.toFixed(2);

  // for small numbers, find the first non zero decimal place
  const str = num.toString();
  const decimalIndex = str.indexOf('.');
  if (decimalIndex === -1) return num.toFixed(2);

  // find the first non zero decimal place
  let firstNonZeroIndex = decimalIndex + 1;
  while (firstNonZeroIndex < str.length && str[firstNonZeroIndex] === '0') {
    firstNonZeroIndex++;
  }

  // display to the first non zero place and two decimal places
  const precision = Math.min(
    firstNonZeroIndex - decimalIndex + 1,
    str.length - decimalIndex - 1,
  );
  return num.toFixed(precision);
};

const mapOrderStatus = (status: string): DepositOrderStatus => {
  switch (status.toLowerCase()) {
    case 'waiting':
      return 'pending';
    case 'confirming':
      return 'confirming';
    case 'confirmed':
      return 'confirming';
    case 'sending':
      return 'confirming';
    case 'finished':
      return 'completed';
    case 'expired':
      return 'expired';
    case 'partially_paid':
      return 'partially_paid';
  }
  return null;
};

// type conversions
export const mapCreatePaymentResponseToPaymentOrder = (
  response: CreateDepositOrderResponse,
): DepositOrder => {
  return {
    paymentId: response.payment_id,
    status: mapOrderStatus(response.payment_status),
    paymentAddress: response.pay_address,
    paymentCurrency: response.pay_currency,
    paymentNetwork: response.network,
    expirationTime: response.expiration_estimate_date,
    totalDue: response.pay_amount,
    received: 0,
    purchasedAmount: response.price_amount - response.estimated_network_fee,
    orderId: response.order_id,
    createdAt: response.created_at,
    updatedAt: response.updated_at,
    ipnPayload: {},
    transferredAmount: 0,
  };
};

export const mapFetchDepositOrderResponseToPaymentOrder = (
  response: FetchDepositOrderResponse,
): DepositOrder => {
  return {
    paymentId: response.db.nowpayments_payment_id,
    status: mapOrderStatus(response.db.status),
    paymentAddress: response.db.pay_address,
    paymentCurrency: response.db.pay_currency,
    paymentNetwork: response.db.network,
    expirationTime: response.db.expiration_estimate_date,
    totalDue: response.db.pay_amount,
    received: response.nowpayments.actually_paid,
    purchasedAmount:
      response.db.price_amount - response.db.estimated_network_fee,
    orderId: response.db.order_id,
    createdAt: response.db.created_at,
    updatedAt: response.db.updated_at,
    ipnPayload: response.db.ipn_payload,
    transferredAmount: response.db.transferred_amount / 10 ** 10,
  };
};

export const mapFetchDepositOrdersResponseItemToPaymentOrder = (
  response: FetchDepositOrdersResponseItem,
): DepositOrder => {
  console.log('mapFetchDepositOrdersResponseItemToPaymentOrder', response);
  return {
    paymentId: response.nowpayments_payment_id,
    status: mapOrderStatus(response.status),
    paymentAddress: response.pay_address,
    paymentCurrency: response.pay_currency,
    paymentNetwork: response.network,
    expirationTime: response.expiration_estimate_date,
    totalDue: response.pay_amount,
    received: response.amount_received,
    purchasedAmount: response.price_amount - response.estimated_network_fee,
    orderId: response.order_id,
    createdAt: response.created_at,
    updatedAt: response.updated_at,
    ipnPayload: response.ipn_payload,
    transferredAmount: response.transferred_amount / 10 ** 10,
  };
};

export const calculateTimeLeft = (estimatedExpirationDate: string) => {
  const expirationTime = new Date(estimatedExpirationDate).getTime();
  const now = Date.now();
  if (expirationTime < now) return 0;
  return Math.max(0, Math.floor((expirationTime - now) / 1000));
};
