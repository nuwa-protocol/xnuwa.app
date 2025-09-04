import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthGuard } from '@/features/auth/components';
import { useAutoLoadingDetection } from '@/shared/hooks/use-auto-loading-detection';
import { MobileWarning } from '../shared/components/mobile-warning';
import { ThemeProvider } from '../shared/components/theme-provider';

export default function RootLayout() {
  // Check if the app is loaded, remove the HTML loading
  useAutoLoadingDetection();

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
