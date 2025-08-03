import AppkitContextProvider from './appkit-context';
import { Wallet } from './wallet';

export function WalletWithProvider() {
  return (
    <AppkitContextProvider>
      <Wallet />
    </AppkitContextProvider>
  );
}
