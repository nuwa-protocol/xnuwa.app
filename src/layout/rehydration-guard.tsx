import { Outlet } from 'react-router-dom';

import { useRehydration } from '@/shared/hooks';

export default function RehydrationGuard() {
  const isRehydrated = useRehydration();

  if (!isRehydrated) return null;

  return <Outlet />;
}
