import { AccountStore } from '@/features/auth/store';
import { useAuthRehydration } from '@/shared/hooks';
import PublicLayout from './public-layout';
import ProtectedLayout from './protected-layout';

/**
 * Chooses between Public and Protected layouts at runtime for the root path.
 * - While auth store is rehydrating: render a minimal shell to avoid flicker.
 * - When no account: render PublicLayout (no app side-effects).
 * - When account exists: render ProtectedLayout (app shell + effects).
 */
export default function AppLayoutSwitch() {
  const isAuthRehydrated = useAuthRehydration();
  const account = AccountStore((s) => s.account);

  if (!isAuthRehydrated) {
    // Minimal container to preserve background/theme
    return <PublicLayout />;
  }

  if (!account) {
    return <PublicLayout />;
  }

  return <ProtectedLayout />;
}
