import { type PaymentAsset, type PaymentResult, pay } from '@reown/appkit-pay';
import { assetMap, networkMap, recipientMap } from '../constants';
import type { Asset, Network } from '../types';
import { useNuwaToUsdRate } from './use-nuwa-to-usd-rate';
import { useWallet } from './use-wallet';

export const useHandlePayment = () => {
  const { addTransaction, setBalance, balance } = useWallet();
  const nuwaToUsdRate = useNuwaToUsdRate();

  const getRecipientAddress = (network: Network): string => {
    return recipientMap[network];
  };

  const getPaymentAsset = (asset: Asset, network: Network): PaymentAsset => {
    return {
      network: networkMap[network] as any,
      asset: assetMap[asset][network],
      metadata: {
        name: asset,
        symbol: asset,
        decimals: asset === 'usdt' ? 6 : 18,
      },
    };
  };

  const handleSuccess = (result: PaymentResult, amount: number) => {
    const hash = result.result as `0x${string}`;

    if (hash) {
      console.log(`Payment successful: ${hash}`);

      setBalance(balance + amount * nuwaToUsdRate);

      addTransaction({
        id: hash,
        type: 'deposit',
        label: 'Deposit',
        amount: amount,
        timestamp: Date.now(),
        status: 'completed',
      });
    } else {
      console.error(`Payment error: ${result.error}`);
    }
  };

  const handleCryptoPayment = async (
    asset: Asset,
    network: Network,
    amount: number,
  ) => {
    const paymentAsset: PaymentAsset = getPaymentAsset(asset, network);

    // pay function returns a PaymentResult object
    const result = await pay({
      recipient: getRecipientAddress(network),
      amount,
      paymentAsset,
    });

    if (result.success) {
      handleSuccess(result, amount);
    } else {
      console.error(`Payment error: ${result.error}`);
    }
  };

  return { handleCryptoPayment };
};
