export type Currency = {
  id: number;
  code: string;
  name: string;
  enable: boolean;
  wallet_regex: string;
  priority: number;
  extra_id_exists: boolean;
  extra_id_regex: string | null;
  logo_url: string;
  track: boolean;
  cg_id: string;
  is_maxlimit: boolean;
  network: string;
  smart_contract: string | null;
  network_precision: number | null;
};

export interface CreateDepositOrderRequest {
  price_amount: number;
  price_currency: string;
  order_id: string;
  order_description: string;
  pay_currency: string;
  ipn_callback_url?: string;
  success_url?: string;
  cancel_url?: string;
  payer_did?: string;
}

export interface CreateDepositOrderResponse {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id: string;
  order_description: string;
  created_at: string;
  updated_at: string;
  purchase_id: string;
  amount_received: number;
  smart_contract: string;
  network: string;
  network_precision: number;
  time_limit: number;
  burning_percent: number;
  expiration_estimate_date: string;
  estimated_network_fee: number;
}

export interface GetMinAmountResponse {
  min_amount: number;
  currency_from: string;
  currency_to: string;
  fiat_equivalent: string;
}

export interface GetOrderAmountWithTxFeeResponse {
  order_amount: number;
  network_fee: number;
  actual_cost: number;
}

export interface GetPaymentEstimatedAmountResponse {
  id: string;
  token_id: string;
  pay_amount: string;
  expiration_estimate_date: string;
}

export interface FetchDepositOrderResponse {
  db: {
    id?: string;
    nowpayments_payment_id: string;
    pay_address: string;
    order_id: string;
    amount_fiat: number;
    currency_fiat: string;
    network: string;
    expiration_estimate_date: string;
    status: string;
    pay_currency: string;
    payer_did?: string;
    transfer_tx?: string | null;
    created_at: string;
    updated_at: string;
    estimated_network_fee: number;
    price_amount: number;
    price_currency?: string;
    pay_amount: number;
    order_description?: string;
    ipn_callback_url?: string;
    purchase_id?: string;
    amount_received?: number;
    payin_extra_id?: string | null;
    smart_contract?: string | null;
    network_precision?: number | null;
    time_limit?: number | null;
    burning_percent?: number | null;
    transferred_amount: number;
    ipn_payload: {
      fee?: {
        currency: string;
        depositFee: number;
        serviceFee: number;
        withdrawalFee: number;
      };
      order_id?: string;
      invoice_id?: string | null;
      pay_amount?: number;
      payment_id?: number;
      updated_at?: number;
      pay_address?: string;
      purchase_id?: string;
      pay_currency?: string;
      price_amount?: number;
      actually_paid?: number;
      outcome_amount?: number;
      payin_extra_id?: string | null;
      payment_status?: string;
      price_currency?: string;
      outcome_currency?: string;
      order_description?: string;
      parent_payment_id?: string | null;
      payment_extra_ids?: any;
      actually_paid_at_fiat?: number;
    };
  };
  nowpayments: {
    payment_id: number;
    invoice_id?: string | null;
    payment_status: string;
    pay_address: string;
    payin_extra_id?: string | null;
    price_amount: number;
    price_currency: string;
    pay_amount: number;
    actually_paid: number;
    pay_currency: string;
    order_id: string;
    order_description: string;
    purchase_id: number;
    outcome_amount: number;
    outcome_currency: string;
    payout_hash?: string | null;
    payin_hash?: string | null;
    created_at: string;
    updated_at: string;
    burning_percent?: string | null;
    type: string;
  };
}

export interface FetchDepositOrdersResponseItem {
  id: string;
  nowpayments_payment_id: string;
  order_id: string;
  amount_fiat: number;
  currency_fiat: string;
  status: string;
  pay_currency: string;
  estimated_network_fee: number;
  payer_did: string;
  transfer_tx: string;
  transferred_amount: number;
  ipn_payload: {
    fee: {
      currency: string;
      depositFee: number;
      serviceFee: number;
      withdrawalFee: number;
    };
    order_id: string;
    invoice_id?: string;
    pay_amount: number;
    payment_id: number;
    updated_at: number;
    pay_address: string;
    purchase_id: string;
    pay_currency: string;
    price_amount: number;
    actually_paid: number;
    outcome_amount: number;
    payin_extra_id?: string;
    payment_status: string;
    price_currency: string;
    outcome_currency: string;
    order_description: string;
    parent_payment_id?: string;
    payment_extra_ids?: string;
    actually_paid_at_fiat: number;
  };
  created_at: string;
  updated_at: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  order_description: string;
  ipn_callback_url: string;
  purchase_id: string;
  amount_received: number;
  payin_extra_id?: string;
  smart_contract?: string;
  network: string;
  network_precision?: number;
  time_limit?: number;
  burning_percent?: number;
  expiration_estimate_date: string;
}

export interface FetchDepositOrdersResponse {
  items: FetchDepositOrdersResponseItem[];
  limit: number;
  offset: number;
  count: number;
}

export interface FetchDepositOrdersFilter {
  status?: string[];
  limit?: number;
  offset?: number;
}

export type DepositOrderStatus =
  | 'pending'
  | 'confirming'
  | 'completed'
  | 'expired'
  | 'partially_paid'
  | null;

// primary types used for UI
export interface DepositOrder {
  paymentId: string;
  status: DepositOrderStatus;
  purchasedAmount: number;
  paymentAddress: string;
  paymentCurrency: string;
  paymentNetwork: string;
  expirationTime: string;
  totalDue: number;
  received: number;
  orderId: string;
  createdAt: string;
  updatedAt: string;
  ipnPayload: any;
  transferredAmount: number;
}
