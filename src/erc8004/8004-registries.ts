import type { Chain } from 'viem';
import registriesConfig from './8004-registries.config.json';
import { resolveChain } from './8004-registry-utils';

// Identity registry config with network support (normalized).
// `id` remains the registry address so downstream code (routing, tags) keeps working.
export type IdentityRegistry = {
  id: `0x${string}`; // registry contract address (used as tag id)
  label: string;
  type: 'tag'; // always tag for registries
  chain: Chain; // viem chain instance (eg. mainnet, sepolia, ...)
  chainId: number; // explicit chain id for convenience
  rpcUrl?: string; // optional RPC override; defaults to chain default when omitted
  explorerBase?: string; // optional explorer base URL (eg. https://etherscan.io)
  marketplace?: { label: string; urlTemplate: string }; // optional marketplace config
};

type IdentityRegistryJson = {
  id: string;
  label: string;
  chainId: number;
  rpcUrl?: string;
  type?: 'tag';
  explorerBase?: string;
  marketplace?: { label: string; urlTemplate: string };
};

// Normalize entries to ensure `type` is always `'tag'` and attach the viem `chain`.
export const REGISTRIES: IdentityRegistry[] = (
  registriesConfig as IdentityRegistryJson[]
).map((r) => ({
  id: r.id as `0x${string}`,
  label: r.label,
  type: 'tag',
  chain: resolveChain(r.chainId),
  chainId: r.chainId,
  rpcUrl: r.rpcUrl,
  explorerBase: r.explorerBase,
  marketplace: r.marketplace,
}));

// Utility: quick lookup by registry address.
export const getRegistryByAddress = (
  address: string,
): IdentityRegistry | undefined =>
  REGISTRIES.find((r) => r.id.toLowerCase() === address.toLowerCase());

// First registry as default (falls back to first entry if present)
export const DEFAULT_REGISTRY: IdentityRegistry | undefined = REGISTRIES[0];

// Re-export helpers for convenience for existing imports
export {
  buildExplorerAddressUrl,
  buildExplorerAddressUrlFromRegistry,
  getMarketplaceLink,
  getMarketplaceLinkFromRegistry,
} from './8004-registry-utils';
