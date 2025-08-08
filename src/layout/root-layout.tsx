import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthGuard } from '@/features/auth/components';
import { ThemeProvider } from '../shared/components/theme-provider';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthGuard>
        <Toaster position="top-center" expand={true} richColors />
        <Outlet />
      </AuthGuard>
    </ThemeProvider>
  );
}
