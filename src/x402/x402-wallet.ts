import {
  type Address,
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
} from 'viem';
import { xLayer, xLayerTestnet } from 'viem/chains';
// Switch from Base/Base-Sepolia to X Layer/X Layer Testnet
import { AccountStore } from '@/features/auth/store';
import type { ManagedAccount } from '@/features/auth/types';

export const networkToChain = {
  'x-layer-testnet': xLayerTestnet,
  'x-layer': xLayer,
} as const;

export type SupportedNetwork = keyof typeof networkToChain;

// Default to X Layer Testnet by default during migration
export const network: SupportedNetwork = 'x-layer-testnet';

// TODO: Confirm USDC (6 decimals) contract addresses on X Layer mainnet & testnet.
// Using placeholders to keep types intact; update before enabling balance calls in production.
export const networkToUsdcAddress = {
  'x-layer-testnet': '0xcb8bf24c6ce16ad21d707c9505421a17f2bec79d',
  'x-layer': '0x0000000000000000000000000000000000000000',
} as const;

// Blockchain explorer configuration
export const networkToExplorerBase = {
  'x-layer-testnet': 'https://www.oklink.com/x-layer-testnet',
  'x-layer': 'https://www.oklink.com/x-layer',
} as const;

/**
 * Get transaction URL on blockchain explorer
 * @param txHash Transaction hash
 * @param network Network name (defaults to current network)
 * @returns Transaction URL or null if txHash is invalid
 */
export const getTransactionUrl = (
  txHash: string | undefined | null,
  networkParam?: SupportedNetwork,
): string | null => {
  if (!txHash) return null;
  const targetNetwork = networkParam ?? network;
  const base = networkToExplorerBase[targetNetwork];
  return `${base}/tx/${txHash}`;
};

/**
 * Get address URL on blockchain explorer
 * @param address Wallet address
 * @param network Network name (defaults to current network)
 * @returns Address URL or null if address is invalid
 */
export const getAddressUrl = (
  address: Address | string | undefined | null,
  networkParam?: SupportedNetwork,
): string | null => {
  if (!address) return null;
  const targetNetwork = networkParam ?? network;
  const base = networkToExplorerBase[targetNetwork];
  return `${base}/address/${address}`;
};

export const publicClients = {
  'x-layer-testnet': createPublicClient({
    chain: networkToChain['x-layer-testnet'],
    transport: http(),
  }),
  'x-layer': createPublicClient({
    chain: networkToChain['x-layer'],
    transport: http(),
  }),
} as const;

export const publicClient = publicClients[network];

const getActiveAccount = (): ManagedAccount => {
  const account = AccountStore.getState().account;
  if (!account) {
    throw new Error(
      'No managed account available. Ask the user to create or unlock an account before performing wallet actions.',
    );
  }
  return account;
};

export const getCurrentAccount = () => getActiveAccount();

export const getWalletClient = () =>
  createWalletClient({
    account: getActiveAccount(),
    transport: http(),
    chain: networkToChain[network],
  });

export const getWalletBalance = async (
  address: Address,
  network: SupportedNetwork,
) => {
  const result = await publicClients[network].readContract({
    address: networkToUsdcAddress[network],
    abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
    functionName: 'balanceOf',
    args: [address],
  });
  return result.toString();
};
