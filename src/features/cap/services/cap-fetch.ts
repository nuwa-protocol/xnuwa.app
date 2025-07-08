import { DIDAuth } from '@nuwa-ai/identity-kit';
import { IdentityKitWeb } from '@nuwa-ai/identity-kit-web';
import type { RemoteCap } from '../types';
import { mockFetchRemoteCaps } from './mock-remote-caps';

export interface CapFetchParams {
  query?: string;
  category?: string;
  author?: string;
  timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  sortBy?: 'downloads' | 'name' | 'updated' | 'created';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CapSearchResponse {
  caps: RemoteCap[];
  total: number;
  hasMore: boolean;
  page: number;
}

export const fetchRemoteCaps = mockFetchRemoteCaps;

// export const fetchRemoteCaps = async (filters: CapFetchParams) => {
//   const response = await fetch('/api/caps', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(filters),
//   });

//   const data = (await response.json()) as CapSearchResponse;
//   return data;
// };

/**
 * Fetch remote caps with DID authentication
 */
export const fetchRemoteCapsWithAuth = async (filters: CapFetchParams) => {
  // We only sign client-side requests
  if (typeof window === 'undefined') {
    throw new Error('fetchRemoteCapsWithAuth is only available on client side');
  }

  try {
    const sdk = await IdentityKitWeb.init({ storage: 'local' });

    // You can change this URL as needed
    const url = new URL('https://api.nuwa.ai/v1/caps');

    // Build signing payload
    const payload = {
      operation: 'llm-gateway-request',
      params: {
        method: 'POST',
        path: url.pathname,
      },
    } as const;

    const sigObj = await sdk.sign(payload);
    const authHeader = DIDAuth.v1.toAuthorizationHeader(sigObj);

    const headers = new Headers();
    headers.set('Authorization', authHeader);
    headers.set('Content-Type', 'application/json');

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers,
      body: JSON.stringify(filters),
    });

    const data = (await response.json()) as CapSearchResponse;
    return data;
  } catch (err) {
    console.error('Failed to fetch remote caps with auth', err);
    throw err;
  }
};
