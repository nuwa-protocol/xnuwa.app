import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from './layout/main-layout';
import RootLayout from './layout/root-layout';
import ArtifactPage from './pages/artifact';
import CallbackPage from './pages/callback';
import ChatPage from './pages/chat';
import ErrorPage from './pages/error';
import LoginPage from './pages/login';
import McpDebugPage from './pages/mcp-debug';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <MainLayout />,
        errorElement: <ErrorPage />,
        children: [
          { index: true, element: <Navigate to="/chat" replace /> },
          { path: 'artifact', element: <ArtifactPage /> },
          { path: 'chat', element: <ChatPage /> },
          { path: 'mcp-debug', element: <McpDebugPage /> },
        ],
      },
      { path: 'login', element: <LoginPage /> },
      { path: 'callback', element: <CallbackPage /> },
    ],
  },
]);

export default router;
