import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { AuthGuard } from '@/features/auth/components';
import { useWalletBalanceManager } from '@/features/wallet/hooks/use-wallet-balance-manager';
import { useLiveCapConnections } from '@/shared/hooks';
import { useAutoLoadingDetection } from '@/shared/hooks/use-auto-loading-detection';
import { MobileWarning } from '../shared/components/mobile-warning';
import { ThemeProvider } from '../shared/components/theme-provider';
import { McpOAuthDialogManager } from '../shared/components/mcp-oauth-dialog';
import {
  StructuredData,
  generateWebSiteSchema,
  generateOrganizationSchema,
} from '../shared/components/structured-data';

export default function RootLayout() {
  // Initialize wallet balance manager
  useWalletBalanceManager();

  // Manage live cap connections globally
  useLiveCapConnections();

  // Check if the app is loaded, remove the HTML loading
  useAutoLoadingDetection();

  // Determine if the viewport is considered mobile
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile === null) return null;

  return (
    <ThemeProvider>
      {isMobile ? (
        // Render only the blocking page on mobile
        <>
          <MobileWarning />
          <StructuredData data={generateWebSiteSchema()} />
          <StructuredData data={generateOrganizationSchema()} />
        </>
      ) : (
        <AuthGuard>
          <Toaster position="top-center" expand={true} richColors />
          <McpOAuthDialogManager />
          <Outlet />
        </AuthGuard>
      )}
    </ThemeProvider>
  );
}
