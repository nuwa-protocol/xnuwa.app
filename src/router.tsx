import { createBrowserRouter } from 'react-router-dom';
import AppLayoutSwitch from './layout/app-layout-switch';
import CapStudioPage from './pages/cap-studio';
import ChatPage from './pages/chat';
import ErrorPage from './pages/error';
import ExplorePage from './pages/explore';
import { LandingPage } from './pages/landing';
import OAuthCallbackPage from './pages/oauth-callback';
import SettingsPage from './pages/settings';
import WalletPage from './pages/wallet';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayoutSwitch />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'wallet', element: <WalletPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'explore/*', element: <ExplorePage /> },
      { path: 'cap-studio/*', element: <CapStudioPage /> },
      { path: 'oauth-callback', element: <OAuthCallbackPage /> },
    ],
  },
]);

export default router;
