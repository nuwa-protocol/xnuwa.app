import { Outlet } from 'react-router-dom';
import { SidebarLayout } from '@/features/sidebar/components';
import { useWalletBalanceManager } from '@/features/wallet/hooks/use-wallet-balance-manager';

export default function MainLayout() {
  // Initialize wallet balance manager
  useWalletBalanceManager();

  return (
    <>
      <script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        async
      />
      <SidebarLayout>
        <Outlet />
      </SidebarLayout>
    </>
  );
}
