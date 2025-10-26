import { create } from 'zustand';
import { getCurrnetAccountBalance } from './services/wallet-client';

function formatBigIntWithDecimals(
  value: bigint,
  decimals: number,
  fractionDigits: number,
): string {
  const negative = value < 0n;
  const v = negative ? -value : value;
  const base = 10n ** BigInt(decimals);
  const integer = v / base;
  let fraction = (v % base).toString().padStart(decimals, '0');
  if (fractionDigits >= 0)
    fraction = fraction.slice(0, Math.min(decimals, fractionDigits));
  const fracPart = fractionDigits > 0 ? `.${fraction}` : '';
  return `${negative ? '-' : ''}${integer.toString()}${fracPart}`;
}

interface WalletState {
  // Payment hub balance
  usdAmount: string;
  balanceLoading: boolean;
  balanceError: string | null;

  fetchPaymentBalance: (assetId?: string) => Promise<void>;
}

export const WalletStore = create<WalletState>()((set, get) => ({
  usdAmount: '0',
  balanceLoading: false,
  balanceError: null,

  fetchPaymentBalance: async (assetId = '0x3::gas_coin::RGas') => {
    set({ balanceLoading: true, balanceError: null });
    try {
      const balance = await getCurrnetAccountBalance();
      set({
        usdAmount: formatBigIntWithDecimals(balance, 8, 8),
        balanceLoading: false,
      });
    } catch (e: any) {
      set({
        balanceError: e?.message || String(e),
        balanceLoading: false,
      });
    }
  },
}));
