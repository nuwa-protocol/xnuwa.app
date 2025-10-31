import {
  createPaymentHeader,
  type PaymentRequirementsSelector,
  selectPaymentRequirements,
} from 'x402/client';
import { decodeXPaymentResponse } from 'x402/shared';
import { PaymentRequirementsSchema, type X402Config } from 'x402/types';
import {
  markX402PaymentResult,
  recordX402PaymentAttempt,
} from './x402-transaction-store';
import {
  parseX402ErrorOrThrow,
  processX402ErrorPayload,
  validateX402Error,
} from './x402-error-utils';
import { getCurrentAccount, network } from './x402-wallet';

type HeadersLike = HeadersInit | undefined;

const CLIENT_TX_HEADER = 'X-Client-Tx-Ref';
const STREAMING_HINTS = ['text/event-stream', 'application/x-ndjson'];

const toURLString = (input: RequestInfo | URL): string => {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  if (input instanceof Request) return input.url;
  return String(input);
};

const getHeaderValue = (
  headers: HeadersLike,
  key: string,
): string | undefined => {
  if (!headers) return undefined;
  const normalizedKey = key.toLowerCase();

  if (headers instanceof Headers) {
    const direct = headers.get(key);
    if (direct) return direct;
    return headers.get(normalizedKey) ?? undefined;
  }

  if (Array.isArray(headers)) {
    const found = headers.find(
      ([name]) => name.toLowerCase() === normalizedKey,
    );
    return found ? found[1] : undefined;
  }

  for (const [name, value] of Object.entries(headers)) {
    if (name.toLowerCase() === normalizedKey) {
      return Array.isArray(value) ? value.join(', ') : value;
    }
  }
  return undefined;
};

const getCtxIdFromHeaders = (
  input: RequestInfo | URL,
  init?: RequestInit,
): string | undefined => {
  const fromInit = getHeaderValue(init?.headers, CLIENT_TX_HEADER);
  if (fromInit) return fromInit;

  if (typeof Request !== 'undefined' && input instanceof Request) {
    return (
      input.headers.get(CLIENT_TX_HEADER) ??
      input.headers.get(CLIENT_TX_HEADER.toLowerCase()) ??
      undefined
    );
  }

  return undefined;
};

const buildHeadersSummary = (
  inputHeaders: HeadersLike,
  initHeaders: HeadersLike,
): Record<string, string> | undefined => {
  const summary: Record<string, string> = {};
  for (const key of ['content-type', 'accept', CLIENT_TX_HEADER]) {
    const value =
      getHeaderValue(initHeaders, key) ?? getHeaderValue(inputHeaders, key);
    if (value) {
      summary[key.toLowerCase()] = value;
    }
  }
  return Object.keys(summary).length > 0 ? summary : undefined;
};

const isStreamingRequest = (
  inputHeaders: HeadersLike,
  initHeaders: HeadersLike,
): boolean => {
  const acceptHeader =
    getHeaderValue(initHeaders, 'accept') ??
    getHeaderValue(inputHeaders, 'accept');
  if (!acceptHeader) return false;
  return STREAMING_HINTS.some((hint) =>
    acceptHeader.toLowerCase().includes(hint),
  );
};

const parseAssetDecimals = (extra: unknown): number | undefined => {
  if (!extra || typeof extra !== 'object') return undefined;
  const maybeDecimals = (extra as Record<string, unknown>).assetDecimals;
  return typeof maybeDecimals === 'number' && Number.isInteger(maybeDecimals)
    ? maybeDecimals
    : undefined;
};

const safeRecord = async (fn: () => Promise<void>) => {
  try {
    await fn();
  } catch (error) {
    console.warn('[x402/tx-store] Failed to record transaction', error);
  }
};

/**
 * Enables the payment of APIs using the x402 payment protocol.
 *
 * This function wraps the native fetch API to automatically handle 402 Payment Required responses
 * by creating and sending a payment header. It will:
 * 1. Make the initial request
 * 2. If a 402 response is received, parse the payment requirements
 * 3. Verify the payment amount is within the allowed maximum
 * 4. Create a payment header using the provided wallet client
 * 5. Retry the request with the payment header
 *
 * @param fetch - The fetch function to wrap (typically globalThis.fetch)
 * @param maxValue - The maximum allowed payment amount in base units (defaults to 0.1 USDC)
 * @param paymentRequirementsSelector - A function that selects the payment requirements from the response
 * @param config - Optional configuration for X402 operations (e.g., custom RPC URLs)
 * @returns A wrapped fetch function that handles 402 responses automatically
 *
 * @example
 * ```typescript
 * const wallet = new SignerWallet(...);
 * const fetchWithPay = wrapFetchWithPayment(fetch, wallet);
 *
 * // With custom RPC configuration
 * const fetchWithPay = wrapFetchWithPayment(fetch, wallet, undefined, undefined, {
 *   svmConfig: { rpcUrl: "http://localhost:8899" }
 * });
 *
 * // Make a request that may require payment
 * const response = await fetchWithPay('https://api.example.com/paid-endpoint');
 * ```
 *
 * @throws {Error} If the payment amount exceeds the maximum allowed value
 * @throws {Error} If the request configuration is missing
 * @throws {Error} If a payment has already been attempted for this request
 * @throws {Error} If there's an error creating the payment header
 */
export function createPaymentFetch(
  maxValue: bigint = BigInt(0.1 * 10 ** 6), // Default to 0.10 USDC
  paymentRequirementsSelector: PaymentRequirementsSelector = selectPaymentRequirements,
  config?: X402Config,
) {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const requestStart = Date.now();
    const response = await fetch(input, init);

    if (response.status !== 402) {
      return response;
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch (error) {
      throw new Error(
        'Failed to parse x402 payment response as JSON',
        error instanceof Error ? { cause: error } : undefined,
      );
    }

    const processed = parseX402ErrorOrThrow(
      payload,
      PaymentRequirementsSchema,
      { allowHeaderRequiredError: true },
    );
    const x402Version = processed.version;

    const parsedPaymentRequirements = processed.requirements;

    const selectedPaymentRequirements = paymentRequirementsSelector(
      parsedPaymentRequirements,
      network,
      'exact',
    );

    const ctxId = getCtxIdFromHeaders(input, init);
    const normalizedUrl = toURLString(input);
    const headersSummary = buildHeadersSummary(
      typeof Request !== 'undefined' && input instanceof Request
        ? input.headers
        : undefined,
      init?.headers,
    );
    const streamHint = isStreamingRequest(
      typeof Request !== 'undefined' && input instanceof Request
        ? input.headers
        : undefined,
      init?.headers,
    );
    const requestMethod = (
      (init?.method ??
        (typeof Request !== 'undefined' && input instanceof Request
          ? input.method
          : undefined) ??
        'GET') as string
    ).toUpperCase();

    let operation = `${requestMethod}:${normalizedUrl}`;
    try {
      operation = `${requestMethod}:${new URL(normalizedUrl).pathname}`;
    } catch {
      // Keep fallback when URL parsing fails (e.g. relative URLs)
    }

    if (ctxId) {
      await safeRecord(() =>
        recordX402PaymentAttempt({
          ctxId,
          requirement: selectedPaymentRequirements,
        }),
      );
    }

    if (BigInt(selectedPaymentRequirements.maxAmountRequired) > maxValue) {
      throw new Error('Payment amount exceeds maximum allowed');
    }

    const account = getCurrentAccount();
    const paymentHeader = await createPaymentHeader(
      account,
      x402Version,
      selectedPaymentRequirements,
      config,
    );

    if (!init) {
      throw new Error('Missing fetch request configuration');
    }

    if ((init as { __is402Retry?: boolean }).__is402Retry) {
      throw new Error('Payment already attempted');
    }

    const newInit = {
      ...init,
      headers: {
        ...(init.headers || {}),
        'X-PAYMENT': paymentHeader,
        'Access-Control-Expose-Headers': 'X-PAYMENT-RESPONSE',
      },
      __is402Retry: true,
    };

    const secondResponse = await fetch(input, newInit);

    if (secondResponse.status === 402) {
      let retryPayload: unknown;
      try {
        retryPayload = await secondResponse.json();
      } catch (error) {
        throw new Error('Failed to parse retry x402 response as JSON', {
          cause: error instanceof Error ? error : undefined,
        });
      }

      const processedRetry = processX402ErrorPayload(
        retryPayload,
        PaymentRequirementsSchema,
      );
      validateX402Error(processedRetry);

      const stillPaymentRequiredError = new Error(
        'Request still requires payment after sending X-PAYMENT header',
      );
      (stillPaymentRequiredError as Error & { status?: number }).status = 402;
      throw stillPaymentRequiredError;
    }
    if (ctxId) {
      // Try to read the payment response header with a robust, case-insensitive lookup.
      // Note: Browser CORS requires the server to expose this header via
      // Access-Control-Expose-Headers: X-PAYMENT-RESPONSE on the RESPONSE.
      // Setting it on the request (as we do) does not make it readable.
      let paymentResponseHeader =
        secondResponse.headers.get('X-PAYMENT-RESPONSE');
      if (!paymentResponseHeader) {
        try {
          for (const [name, value] of secondResponse.headers.entries()) {
            if (name.toLowerCase() === 'x-payment-response') {
              paymentResponseHeader = value;
              break;
            }
          }
        } catch {}
      }

      let decoded: ReturnType<typeof decodeXPaymentResponse> | undefined;
      if (paymentResponseHeader) {
        try {
          decoded = decodeXPaymentResponse(paymentResponseHeader);
        } catch (error) {
          console.error(
            '[x402/tx-store] Failed to decode X-PAYMENT-RESPONSE header',
            error,
          );
        }
      } else {
        console.error(
          '[x402/tx-store] X-PAYMENT-RESPONSE header not accessible. Ensure the server sets Access-Control-Expose-Headers: X-PAYMENT-RESPONSE on the response.',
        );
      }
      await safeRecord(() =>
        markX402PaymentResult({
          ctxId,
          response: decoded,
        }),
      );
    }
    return secondResponse;
  };
}
export type { Hex } from 'viem';
export type { PaymentRequirementsSelector } from 'x402/client';

export { decodeXPaymentResponse } from 'x402/shared';
export {
  createSigner,
  type MultiNetworkSigner,
  type Signer,
  type X402Config,
} from 'x402/types';
