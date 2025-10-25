import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './layout/main-layout';
import ProtectedLayout from './layout/protected-layout';
import PublicLayout from './layout/public-layout';
import RehydrationGuard from './layout/rehydration-guard';
import RootLayout from './layout/root-layout';
import CallbackPage from './pages/callback';
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
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <PublicLayout />,
        errorElement: <ErrorPage />,
        children: [{ index: true, element: <LandingPage /> }],
      },
      {
        element: <ProtectedLayout />,
        errorElement: <ErrorPage />,
        children: [
          {
            element: <RehydrationGuard />,
            errorElement: <ErrorPage />,
            children: [
              {
                element: <MainLayout />,
                errorElement: <ErrorPage />,
                children: [
                  {
                    path: 'chat',
                    element: <ChatPage />,
                  },
                  { path: 'wallet', element: <WalletPage /> },
                  { path: 'settings', element: <SettingsPage /> },
                  { path: 'explore/*', element: <ExplorePage /> },
                  { path: 'cap-studio/*', element: <CapStudioPage /> },
                ],
              },
            ],
          },
        ],
      },
      { path: 'callback', element: <CallbackPage /> },
      { path: 'oauth-callback', element: <OAuthCallbackPage /> },
    ],
  },
]);

export default router;
