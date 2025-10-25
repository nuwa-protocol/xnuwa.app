import {
  type Address,
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base, baseSepolia } from 'viem/chains';

// address 0x87fa41edd43ce8374c47059ae613968a2eb971af
const privateKey =
  '0xe53bdfab2c936c9461f5a27449d12122441e422ffc88ad6dd8f62530e5853068';

export const account = privateKeyToAccount(privateKey);

export const network = 'base-sepolia';

const networkToChain = {
  'base-sepolia': baseSepolia,
  base: base,
} as const;

const networkToUsdcAddress = {
  'base-sepolia': '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
} as const;

export const walletClient = createWalletClient({
  account: account,
  transport: http(),
  chain: networkToChain[network],
});

export const publicClient = createPublicClient({
  chain: networkToChain[network],
  transport: http(),
});

export const getWalletBalance = async (
  address: Address,
  network: 'base-sepolia' | 'base',
) => {
  const result = await publicClient.readContract({
    address: networkToUsdcAddress[network],
    abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
    functionName: 'balanceOf',
    args: [address],
  });
  return result.toString();
};
