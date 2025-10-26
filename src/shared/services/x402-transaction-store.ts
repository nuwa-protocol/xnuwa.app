import {
  createTransactionStore,
  type TransactionRecord,
  type TransactionStatus,
  type TransactionStore,
} from '@nuwa-ai/payment-kit';

const USD_PICO_DECIMALS = 12n;
const DEFAULT_ASSET_DECIMALS = 6;

const hasIndexedDB =
  typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';

const transactionStore = createTransactionStore({
  backend: hasIndexedDB ? 'indexeddb' : 'memory',
  maxRecords: 2000,
});

type NumericLike = bigint | number | string;

const toBigInt = (value: NumericLike): bigint => {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') return BigInt(Math.trunc(value));
  return BigInt(value);
};

const pow10 = (exp: number): bigint => {
  if (exp <= 0) return 1n;
  return 10n ** BigInt(exp);
};

const convertAtomicToPicoUsd = (
  amount: bigint,
  assetDecimals: number = DEFAULT_ASSET_DECIMALS,
): bigint => {
  if (assetDecimals === Number(USD_PICO_DECIMALS)) {
    return amount;
  }

  if (assetDecimals > Number(USD_PICO_DECIMALS)) {
    const divisor = pow10(assetDecimals - Number(USD_PICO_DECIMALS));
    return amount / divisor;
  }

  const multiplier = pow10(Number(USD_PICO_DECIMALS) - assetDecimals);
  return amount * multiplier;
};

export interface RecordX402PaymentAttemptParams {
  ctxId: string;
  protocol: TransactionRecord['protocol'];
  method?: string;
  urlOrTarget: string;
  operation?: string;
  headersSummary?: Record<string, string>;
  requestBodyHash?: string;
  stream?: boolean;
  assetId: string;
  amount: NumericLike;
  assetDecimals?: number;
  meta?: Record<string, unknown>;
}

interface PaymentResponseMetadata {
  serviceTxRef?: string;
  metadata?: unknown;
}

export interface MarkX402PaymentResultParams {
  ctxId: string;
  status: TransactionStatus;
  statusCode?: number;
  durationMs?: number;
  errorCode?: string;
  errorMessage?: string;
  paymentOverrides?: Partial<TransactionRecord['payment']>;
  paymentResponse?: PaymentResponseMetadata;
}

const ensurePaymentSnapshot = (
  existing: TransactionRecord | null,
  fallbackAmount: bigint,
  assetDecimals: number = DEFAULT_ASSET_DECIMALS,
  overrides?: Partial<TransactionRecord['payment']>,
): TransactionRecord['payment'] => {
  const base = existing?.payment ?? {
    cost: fallbackAmount,
    costUsd: convertAtomicToPicoUsd(fallbackAmount, assetDecimals),
    nonce: 0n,
  };

  return {
    ...base,
    ...overrides,
  };
};

const mergeMeta = (
  existing: TransactionRecord | null,
  next?: Record<string, unknown>,
  paymentResponse?: PaymentResponseMetadata,
): Record<string, unknown> | undefined => {
  if (!existing?.meta && !next && !paymentResponse) {
    return undefined;
  }

  const merged: Record<string, unknown> = {
    ...(existing?.meta ?? {}),
    ...(next ?? {}),
  };

  if (paymentResponse && 'metadata' in paymentResponse) {
    merged.x402PaymentResponse = paymentResponse.metadata;
  }

  return merged;
};

export function getX402TransactionStore(): TransactionStore {
  return transactionStore;
}

export async function recordX402PaymentAttempt(
  params: RecordX402PaymentAttemptParams,
): Promise<void> {
  if (!params.ctxId) return;

  const existing = await transactionStore.get(params.ctxId);
  if (existing) {
    // No-op to avoid overwriting existing data when the same ctxId appears twice.
    return;
  }

  const amount = toBigInt(params.amount);
  const record: TransactionRecord = {
    clientTxRef: params.ctxId,
    timestamp: Date.now(),
    protocol: params.protocol,
    method: params.method,
    urlOrTarget: params.urlOrTarget,
    operation: params.operation,
    headersSummary: params.headersSummary,
    requestBodyHash: params.requestBodyHash,
    stream: params.stream ?? true,
    assetId: params.assetId,
    status: 'pending',
    payment: {
      cost: amount,
      costUsd: convertAtomicToPicoUsd(
        amount,
        params.assetDecimals ?? DEFAULT_ASSET_DECIMALS,
      ),
      nonce: 0n,
    },
    meta: params.meta,
  };

  await transactionStore.create(record);
}

export async function markX402PaymentResult(
  params: MarkX402PaymentResultParams,
): Promise<void> {
  if (!params.ctxId) return;

  const existing = await transactionStore.get(params.ctxId);
  if (!existing) {
    return;
  }

  const payment = ensurePaymentSnapshot(
    existing,
    existing.payment?.cost ?? 0n,
    DEFAULT_ASSET_DECIMALS,
    {
      ...(params.paymentOverrides ?? {}),
      serviceTxRef:
        params.paymentResponse?.serviceTxRef ??
        params.paymentOverrides?.serviceTxRef ??
        existing.payment?.serviceTxRef,
    },
  );

  const meta = mergeMeta(existing, undefined, params.paymentResponse);

  await transactionStore.update(params.ctxId, {
    status: params.status,
    statusCode: params.statusCode,
    durationMs: params.durationMs,
    errorCode: params.errorCode,
    errorMessage: params.errorMessage,
    payment,
    meta,
  });
}
