import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthGuard } from '@/features/auth/components';
import { useWalletBalanceManager } from '@/features/wallet/hooks/use-wallet-balance-manager';
import { useRehydration } from '@/shared/hooks';
import { useAutoLoadingDetection } from '@/shared/hooks/use-auto-loading-detection';
import { MobileWarning } from '../shared/components/mobile-warning';
import { ThemeProvider } from '../shared/components/theme-provider';

export default function RootLayout() {
  // Initialize wallet balance manager
  useWalletBalanceManager();

  // Check if the app is loaded, remove the HTML loading
  useAutoLoadingDetection();

  // Check if the app is rehydrated
  const isRehydrated = useRehydration();
  if (!isRehydrated) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthGuard>
        <Toaster position="top-center" expand={true} richColors />
        <MobileWarning />
        <Outlet />
      </AuthGuard>
    </ThemeProvider>
  );
}
