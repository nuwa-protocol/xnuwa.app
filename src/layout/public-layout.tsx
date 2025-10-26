import { Outlet } from 'react-router-dom';
import { useHideInitialLoading } from '@/shared/hooks/use-auto-loading-detection';

export default function PublicLayout() {
  // Ensure the HTML-level loader is hidden ASAP on public routes (fallback)
  useHideInitialLoading();
  return <Outlet />;
}
