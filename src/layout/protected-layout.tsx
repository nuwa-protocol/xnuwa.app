import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthRequestDialog } from '@/features/auth/components/auth-request-dialog';
import { DebugAccountInfo } from '@/features/auth/components/debug-account-info';
import AppSidebar from '@/features/sidebar/components';
import { useWalletBalanceManager } from '@/features/wallet/hooks/use-wallet-balance-manager';
import { McpOAuthDialogManager } from '@/shared/components/mcp-oauth-dialog';
import { MobileWarning } from '@/shared/components/mobile-warning';
import { useLiveCapConnections, useRehydration } from '@/shared/hooks';
import { useAutoLoadingDetection } from '@/shared/hooks/use-auto-loading-detection';
import { UiProviders } from './ui-providers';

export default function ProtectedLayout() {
  // App global side effects (only when inside the app)
  useWalletBalanceManager();
  useLiveCapConnections();
  useAutoLoadingDetection();

  // Wait for all registered stores to rehydrate before rendering shell
  const isRehydrated = useRehydration();

  // Determine if the viewport is considered mobile
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile) return <MobileWarning />;

  return (
    <UiProviders>
      <McpOAuthDialogManager />
      <AuthRequestDialog />
      {isRehydrated ? (
        <>
          <AppSidebar>
            <Outlet />
          </AppSidebar>
          <DebugAccountInfo />
        </>
      ) : null}
    </UiProviders>
  );
}
