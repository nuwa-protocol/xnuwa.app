import { createBrowserRouter } from 'react-router-dom';
import AppLayoutSwitch from './layout/app-layout-switch';
import { AuthGuard } from '@/features/auth/components/auth-guard';
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
      { path: 'chat', element: (
          <AuthGuard>
            <ChatPage />
          </AuthGuard>
        )
      },
      { path: 'wallet', element: (
          <AuthGuard>
            <WalletPage />
          </AuthGuard>
        )
      },
      { path: 'settings', element: (
          <AuthGuard>
            <SettingsPage />
          </AuthGuard>
        )
      },
      { path: 'explore/*', element: (
          <AuthGuard>
            <ExplorePage />
          </AuthGuard>
        )
      },
      { path: 'cap-studio/*', element: (
          <AuthGuard>
            <CapStudioPage />
          </AuthGuard>
        )
      },
      { path: 'oauth-callback', element: <OAuthCallbackPage /> },
    ],
  },
]);

export default router;
