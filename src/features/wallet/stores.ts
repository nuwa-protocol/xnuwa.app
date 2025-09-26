import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getPaymentHubClient } from '@/shared/services/payment-clients';
import { createLocalStoragePersistConfig } from '@/shared/storage';

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
  rgasAmount: string;
  usdAmount: string;
  balanceLoading: boolean;
  balanceError: string | null;

  fetchPaymentBalance: (assetId?: string) => Promise<void>;
}

const persistConfig = createLocalStoragePersistConfig<WalletState>({
  name: 'wallet-storage',
  partialize: (state) => ({
    rgasAmount: state.rgasAmount,
    usdAmount: state.usdAmount,
  }),
});

export const WalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      rgasAmount: '0',
      usdAmount: '0',
      balanceLoading: false,
      balanceError: null,

      fetchPaymentBalance: async (assetId = '0x3::gas_coin::RGas') => {
        set({ balanceLoading: true, balanceError: null });
        try {
          const hub = await getPaymentHubClient(assetId);
          const res = await hub.getBalanceWithUsd({ assetId });
          set({
            rgasAmount: formatBigIntWithDecimals(res.balance, 8, 8),
            usdAmount: formatBigIntWithDecimals(res.balancePicoUSD, 12, 2),
            balanceLoading: false,
          });
        } catch (e: any) {
          set({
            balanceError: e?.message || String(e),
            balanceLoading: false,
          });
        }
      },
    }),
    persistConfig,
  ),
);
