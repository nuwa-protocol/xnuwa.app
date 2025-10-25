import { Outlet } from 'react-router-dom';
import { AuthGuard } from '@/features/auth/components/auth-guard';

export default function ProtectedLayout() {
  return (
    <AuthGuard>
      <Outlet />
    </AuthGuard>
  );
}
