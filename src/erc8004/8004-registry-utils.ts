import type { Chain } from 'viem';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
  zora,
} from 'viem/chains';

// Resolve a viem `Chain` from a numeric chainId. Fallback to mainnet.
export function resolveChain(chainId: number): Chain {
  switch (chainId) {
    case 1:
      return mainnet;
    case 10:
      return optimism;
    case 137:
      return polygon;
    case 42161:
      return arbitrum;
    case 8453:
      return base;
    case 7777777:
      return zora;
    case 11155111:
      return sepolia;
    default:
      return mainnet;
  }
}

// Build an address page URL for the registry contract on the chain's default explorer.
export function buildExplorerAddressUrl(
  chain: Chain,
  address: `0x${string}`,
): string {
  const base =
    chain.blockExplorers?.default?.url?.replace(/\/$/, '') ||
    'https://etherscan.io';
  return `${base}/address/${address}`;
}

// Resolve a marketplace link for an NFT contract by chain.
// - Uses OpenSea for popular supported networks.
// - Uses Zora marketplace for Zora chain.
// - Returns `undefined` if no known marketplace mapping.
export function getMarketplaceLink(
  chainId: number,
  address: `0x${string}`,
): { label: string; url: string } | undefined {
  // Prefer native marketplace for Zora chain
  if (chainId === 7777777) {
    return { label: 'Zora', url: `https://zora.co/collections/${address}` };
  }

  const openseaSlugById: Record<number, string> = {
    1: 'ethereum', // mainnet
    10: 'optimism',
    137: 'matic', // polygon
    42161: 'arbitrum',
    8453: 'base',
    7777777: 'zora', // zora also supported by OpenSea
  };
  const slug = openseaSlugById[chainId];
  if (slug) {
    return {
      label: 'OpenSea',
      url: `https://opensea.io/assets/${slug}/${address}`,
    };
  }
  return undefined;
}

// Config-aware helpers
export type MarketplaceConfig = { label: string; urlTemplate: string };

export type RegistryWithConfig = {
  chain: Chain;
  chainId: number;
  explorerBase?: string;
  marketplace?: MarketplaceConfig;
};

export function buildExplorerAddressUrlFromRegistry(
  registry: RegistryWithConfig,
  address: `0x${string}`,
): string {
  const base = (registry.explorerBase || registry.chain.blockExplorers?.default?.url || 'https://etherscan.io')
    .replace(/\/$/, '');
  return `${base}/address/${address}`;
}

export function getMarketplaceLinkFromRegistry(
  registry: RegistryWithConfig,
  address: `0x${string}`,
): { label: string; url: string } | undefined {
  if (registry.marketplace?.urlTemplate && registry.marketplace?.label) {
    return {
      label: registry.marketplace.label,
      url: registry.marketplace.urlTemplate.replace('{address}', address),
    };
  }
  // Fallback to built-in mapping if config not provided
  return getMarketplaceLink(registry.chainId, address);
}
