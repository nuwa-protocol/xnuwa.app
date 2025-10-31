import { type Abi, createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import {
  type Agent8004,
  type Agent8004Endpoint,
  Agent8004EndpointSchema,
  Agent8004Schema,
  type AgentRegistration,
  AgentRegistrationSchema,
  EIP8004_REGISTRATION_V1,
  type ErrorAgent8004,
  SupportedTrustSchema,
} from '@/shared/types/8004-agent';
import identityRegistry from './identity-registry-abi.json';

const registryNetwork = mainnet;
// Default Identity Registry address; callers can override via function params
export const DEFAULT_IDENTITY_REGISTRY_ADDRESS: `0x${string}` =
  '0x4f4B183eAE80D62B880458E4A812F896CFb2d4d6';

// Use the contract ABI from the local JSON file
const registryABI = identityRegistry.abi as Abi;

// Use a public RPC; allow override via env for stability in production
const rpcUrl = (import.meta as any)?.env?.VITE_MAINNET_RPC_URL as
  | string
  | undefined;
const client = createPublicClient({
  chain: registryNetwork,
  transport: rpcUrl ? http(rpcUrl) : http(),
});

// Simple in-memory cache for totalAgents to avoid repeating the on-chain call
const TOTAL_AGENTS_TTL_MS = 3 * 60 * 1000; // 3 minutes
const totalAgentsCache = new Map<string, { value: number; ts: number }>();

export const getAgentTokenURI = async (
  registryAddress: `0x${string}`,
  agentId: string,
): Promise<string> => {
  const agentTokenURI = await client.readContract({
    address: registryAddress,
    abi: registryABI,
    functionName: 'tokenURI',
    args: [BigInt(agentId)],
  });
  return agentTokenURI as string;
};

export const getTotalAgents = async (
  registryAddress: `0x${string}`,
): Promise<bigint> => {
  const cached = totalAgentsCache.get(registryAddress);
  const now = Date.now();
  if (cached && now - cached.ts < TOTAL_AGENTS_TTL_MS) {
    return BigInt(cached.value);
  }
  const totalAgents = (await client.readContract({
    address: registryAddress,
    abi: registryABI,
    functionName: 'totalAgents',
  })) as bigint;
  // Cache numeric version to avoid BigInt serialization issues
  totalAgentsCache.set(registryAddress, {
    value: Number(totalAgents),
    ts: now,
  });
  return totalAgents;
};

// Compute the list of agent IDs for a given page and size (0-based page indexing)
export const getAgentsByPage = async (
  registryAddress: `0x${string}`,
  page: number,
  pageSize: number,
): Promise<number[]> => {
  // Guard invalid inputs
  if (!Number.isFinite(page) || !Number.isFinite(pageSize)) return [];
  if (page < 0 || pageSize <= 0) return [];

  const total = Number(await getTotalAgents(registryAddress));
  if (!Number.isFinite(total) || total <= 0) return [];

  const start = page * pageSize;
  if (start >= total) return [];

  const end = Math.min(start + pageSize, total);
  // Agent ID equals index assumption (0-based)
  return Array.from({ length: end - start }, (_, i) => start + i + 1);
};

export const getAgentsTokenURIByPage = async (
  registryAddress: `0x${string}`,
  page: number,
  pageSize: number,
): Promise<string[]> => {
  const ids = await getAgentsByPage(registryAddress, page, pageSize);
  if (ids.length === 0) return [] as string[];

  const contracts = ids.map((id) => ({
    address: registryAddress,
    abi: registryABI,
    functionName: 'tokenURI' as const,
    args: [BigInt(id)],
  }));

  // Use multicall to batch tokenURI reads; allowFailure=true so one bad item does not fail all
  const results = await client.multicall({ contracts, allowFailure: true });

  // Extract successful tokenURIs in order
  return results
    .map((r) => (r.status === 'success' ? (r.result as string) : undefined))
    .filter((v): v is string => typeof v === 'string');
};

export const getOwnerAddressByAgentId = async (
  registryAddress: `0x${string}`,
  agentId: string,
): Promise<string> => {
  const ownerAddress = await client.readContract({
    address: registryAddress,
    abi: registryABI,
    functionName: 'ownerOf',
    args: [BigInt(agentId)],
  });
  return ownerAddress as string;
};

// Batch read owners for multiple agent IDs using multicall
export const getOwnerAddressesByAgentIds = async (
  registryAddress: `0x${string}`,
  agentIds: number[],
): Promise<string[]> => {
  if (!agentIds.length) return [];
  const contracts = agentIds.map((id) => ({
    address: registryAddress,
    abi: registryABI,
    functionName: 'ownerOf' as const,
    args: [BigInt(id)],
  }));
  const results = await client.multicall({ contracts, allowFailure: true });
  return results
    .map((r) => (r.status === 'success' ? (r.result as string) : undefined))
    .filter((v): v is string => typeof v === 'string');
};

// Internal helper: minimal URL test for http(s)
const isHttpUrl = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

// Internal helper: build the most complete partial Agent8004 we can from a raw object
const toPartialAgent8004 = (raw: any): Partial<Agent8004> => {
  const p: Partial<Agent8004> = {};
  if (raw && typeof raw === 'object') {
    if (raw.type === EIP8004_REGISTRATION_V1) p.type = EIP8004_REGISTRATION_V1;
    if (typeof raw.name === 'string') p.name = raw.name;
    if (typeof raw.description === 'string') p.description = raw.description;
    if (isHttpUrl(raw.image)) p.image = raw.image;

    if (Array.isArray(raw.endpoints)) {
      const eps = raw.endpoints
        .map((e: unknown) => Agent8004EndpointSchema.safeParse(e))
        .filter(
          (r: {
            success: boolean;
          }): r is { success: true; data: Agent8004Endpoint } =>
            r.success === true,
        )
        .map((r: { success: true; data: Agent8004Endpoint }) => r.data);
      if (eps.length) p.endpoints = eps as Agent8004['endpoints'];
    }

    if (Array.isArray(raw.registrations)) {
      const regs = raw.registrations
        .map((r: unknown) => AgentRegistrationSchema.safeParse(r))
        .filter(
          (r: {
            success: boolean;
          }): r is { success: true; data: AgentRegistration } =>
            r.success === true,
        )
        .map((r: { success: true; data: AgentRegistration }) => r.data);
      if (regs.length) p.registrations = regs as Agent8004['registrations'];
    }

    if (Array.isArray(raw.supportedTrust)) {
      const trusts = raw.supportedTrust
        .map((t: unknown) => SupportedTrustSchema.safeParse(t))
        .filter((r: { success: boolean }) => r.success === true)
        .map((r: { success: true; data: string }) => r.data);
      if (trusts.length)
        p.supportedTrust = trusts as Agent8004['supportedTrust'];
    }
  }
  return p;
};

// Fetch an Agent8004 JSON from a tokenURI, validate, and return either Agent8004 or ErrorAgent8004
export const fetchAgent8004FromTokenURI = async (
  tokenUri: string,
): Promise<Agent8004 | ErrorAgent8004> => {
  if (!isHttpUrl(tokenUri)) {
    return { error: 'Invalid tokenURI: not an http(s) URL' };
  }
  try {
    const res = await fetch(tokenUri, {
      headers: { Accept: 'application/json' },
      // Allow the browser to cache these JSONs to reduce variability between loads
      cache: 'default',
    });
    if (!res.ok) {
      return {
        error: `Failed to fetch tokenURI (${res.status} ${res.statusText})`,
      };
    }
    const data = await res.json();
    const parsed = Agent8004Schema.safeParse(data);
    if (parsed.success) return parsed.data;

    // Build the richest partial we can for error case
    const partial = toPartialAgent8004(data);
    return { ...partial, error: parsed.error.message } as ErrorAgent8004;
  } catch (err: any) {
    const msg =
      typeof err?.message === 'string' ? err.message : 'Unknown error';
    return { error: `Fetch error: ${msg}` } as ErrorAgent8004;
  }
};

// Convenience: for a page, fetch tokenURIs, then resolve JSONs to Agent8004 or ErrorAgent8004
// Utility: map with concurrency limit, preserving order
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const current = nextIndex;
      if (current >= items.length) return;
      nextIndex++;
      try {
        results[current] = await mapper(items[current], current);
      } catch (e) {
        // Bubble up errors as undefined-like entries; the caller can handle failures
        // @ts-expect-error
        results[current] = undefined;
      }
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () =>
    worker(),
  );
  await Promise.all(workers);
  return results;
}

export const getAgent8004ByPage = async (
  registryAddress: `0x${string}`,
  page: number,
  pageSize: number,
): Promise<Array<Agent8004 | ErrorAgent8004>> => {
  const uris = await getAgentsTokenURIByPage(registryAddress, page, pageSize);
  if (!uris.length) return [];
  // Limit concurrent fetches to reduce variability from remote gateways
  const results = await mapWithConcurrency(
    uris,
    12,
    (uri) => fetchAgent8004FromTokenURI(uri),
  );
  return results;
};
