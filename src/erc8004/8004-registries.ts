import type { Chain } from 'viem';
import { mainnet } from 'viem/chains';
import type { CapStoreSection } from '../features/cap-store/types';

// Identity registry config with network support.
// `id` remains the registry address so downstream code (routing, tags) keeps working.
export type IdentityRegistry = Omit<CapStoreSection, 'id'> & {
  id: `0x${string}`; // registry contract address (used as tag id)
  chain: Chain; // viem chain instance (eg. mainnet, sepolia, ...)
  chainId: number; // explicit chain id for convenience
  rpcUrl?: string; // optional RPC override; defaults to chain default when omitted
};

// Known ERC-8004 Identity Registries across networks.
// Add more entries here to support additional networks/registries.
export const REGISTRIES: IdentityRegistry[] = [
  {
    id: '0x4f4B183eAE80D62B880458E4A812F896CFb2d4d6',
    label: 'Nuwa Agents',
    type: 'tag',
    chain: mainnet,
    chainId: mainnet.id,
    // You can override the RPC per environment if needed (optional)
    rpcUrl:
      (import.meta as any)?.env?.VITE_MAINNET_RPC_URL ||
      (import.meta as any)?.env?.VITE_RPC_URL_1 ||
      undefined,
  },
];

// Utility: quick lookup by registry address.
export const getRegistryByAddress = (
  address: string,
): IdentityRegistry | undefined =>
  REGISTRIES.find((r) => r.id.toLowerCase() === address.toLowerCase());

// First registry as default (falls back to mainnet Nuwa Agents if present)
export const DEFAULT_REGISTRY: IdentityRegistry | undefined = REGISTRIES[0];
