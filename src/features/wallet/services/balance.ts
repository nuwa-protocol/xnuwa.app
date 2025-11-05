import { type Address, parseAbi } from 'viem';
import { AccountStore } from '@/features/auth/store';
import type { ManagedAccount } from '@/features/auth/types';
import {
  network,
  networkToUsdcAddress,
  publicClients,
  type SupportedNetwork,
} from '@/x402/x402-wallet';

const getActiveAccount = (): ManagedAccount => {
  const account = AccountStore.getState().account;
  if (!account) {
    throw new Error(
      'No managed account available. Ask the user to create or unlock an account before performing wallet actions.',
    );
  }
  return account;
};

const getWalletBalance = async (
  address: Address,
  network: SupportedNetwork,
) => {
  const result = await publicClients[network].readContract({
    address: networkToUsdcAddress[network],
    abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
    functionName: 'balanceOf',
    args: [address],
  });
  return result;
};

export const getCurrnetAccountBalance = async () => {
  const account = getActiveAccount();
  return await getWalletBalance(account.address, network);
};
