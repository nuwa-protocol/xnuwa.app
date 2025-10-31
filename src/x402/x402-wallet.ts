import {
  type Address,
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
} from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { AccountStore } from '@/features/auth/store';
import type { ManagedAccount } from '@/features/auth/types';

export const network = 'base-sepolia' as const;

const networkToChain = {
  'base-sepolia': baseSepolia,
  base: base,
} as const;

const networkToUsdcAddress = {
  'base-sepolia': '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
} as const;

const publicClients = {
  'base-sepolia': createPublicClient({
    chain: networkToChain['base-sepolia'],
    transport: http(),
  }),
  base: createPublicClient({
    chain: networkToChain.base,
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
  network: 'base-sepolia' | 'base',
) => {
  const result = await publicClients[network].readContract({
    address: networkToUsdcAddress[network],
    abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
    functionName: 'balanceOf',
    args: [address],
  });
  return result.toString();
};
