import { Wallet } from './wallet';

export function WalletWithProvider() {
  return (
    // <AppkitContextProvider>
    <Wallet />
    // </AppkitContextProvider>
  );
}

export { NowPaymentsTopupModal } from './nowpayments-topup-modal';
export { PaymentWindow } from './payment-window';
export { OrdersList } from './orders-list';
