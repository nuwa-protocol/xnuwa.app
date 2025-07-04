import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthGuard } from '@/features/auth/components';
import { ErrorBoundary } from '@/shared/components';
import { ThemeProvider } from '../shared/components/theme-provider';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.error('Application error:', error, errorInfo);
        }}
      >
        <AuthGuard>
          <Toaster position="top-center" />
          <Outlet />
        </AuthGuard>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
