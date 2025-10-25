import { Outlet } from 'react-router-dom';
import AppSidebar from '@/features/sidebar/components';
import { DebugAccountInfo } from '@/shared/components/debug-account-info';
import { TooltipProvider } from '@/shared/components/ui/tooltip';

export default function MainLayout() {
  return (
    <>
      <script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        async
      />
      <TooltipProvider delayDuration={0}>
        <AppSidebar>
          <Outlet />
        </AppSidebar>
        <DebugAccountInfo />
      </TooltipProvider>
    </>
  );
}
