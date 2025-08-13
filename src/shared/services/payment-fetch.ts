import { createHttpClient } from '@nuwa-ai/payment-kit';
import type { PaymentChannelHttpClient } from '@nuwa-ai/payment-kit';
import { IdentityKitWeb } from '@nuwa-ai/identity-kit-web';

/**
 * Create a fetch-compatible function backed by Payment Kit.
 * It automatically handles payment-channel headers and streaming settlement.
 */
export function createPaymentFetch(baseUrl: string, options?: { maxAmount?: bigint }) {
  let clientPromise: Promise<PaymentChannelHttpClient> | null = null;

  async function ensureClient(): Promise<PaymentChannelHttpClient> {
    if (!clientPromise) {
      const sdk = await IdentityKitWeb.init({ storage: 'local' });
      const env = sdk.getIdentityEnv();
      clientPromise = createHttpClient({
        baseUrl,
        env,
        maxAmount: options?.maxAmount,
        debug: false,
      });
    }
    return clientPromise;
  }

  return async function paymentFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const targetUrl = new URL(typeof input === 'string' ? input : (input as any).url ?? input.toString());
    const methodFromInit = (init?.method ?? 'POST').toUpperCase() as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

    const client = await ensureClient();
    // Important: do NOT wait for payment resolution here, otherwise
    // streaming responses may time out before emitting the in-band payment header.
    const handle = await client.createRequestHandle(methodFromInit, targetUrl.toString(), init);
    return handle.response;
  };
}


