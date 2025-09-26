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

export interface CreatePaymentOrderRequest {
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

export interface CreatePaymentOrderResponse {
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
}

export interface CheckPaymentStatusResponse {
  payment_id: string;
  invoice_id: string;
  payment_status: string;
  pay_address: string;
  payin_extra_id: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  actually_paid: number;
  pay_currency: string;
  order_id: string;
  order_description: string;
  purchase_id: string;
  outcome_amount: number;
  outcome_currency: string;
  payout_hash: string;
  payin_hash: string;
  created_at: string;
  updated_at: string;
  burning_percent: number;
  type: string;
  payment_extra_ids: string[];
}

export interface PaymentOrder {
  paymentId: string;
  status: string;
  purchasedAmount: number;
  paymentAddress: string;
  paymentCurrency: string;
  paymentNetwork: string;
  expirationTime: string;
  totalDue: number;
  received: number;
  orderId: string;
  network: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetMinAmountResponse {
  min_amount: number;
  currency_from: string;
  currency_to: string;
}

export interface DepositTransaction {
  id?: string;
  nowpayments_payment_id: string;
  order_id?: string;
  amount_fiat: number;
  currency_fiat: string;
  status: string;
  pay_currency?: string;
  payer_did?: string;
  transfer_tx?: string | null;
  ipn_payload?: any;
  created_at?: string;
  updated_at?: string;
}

export interface DepositTransactionsResponse {
  items: DepositTransaction[];
  limit: number;
  offset: number;
  count: number;
}

export interface DepositTransactionFilter {
  status?: string[];
  limit?: number;
  offset?: number;
}
