import { Outlet } from 'react-router-dom';
import { UiProviders } from './ui-providers';

export default function PublicLayout() {
  // Public area renders with UI providers only; no app-level side effects
  return (
    <UiProviders>
      <Outlet />
    </UiProviders>
  );
}
