import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from './layout/main-layout';
import RootLayout from './layout/root-layout';
import CallbackPage from './pages/callback';
import CapDevPage from './pages/cap-dev';
import ChatPage from './pages/chat';
import ErrorPage from './pages/error';
import LoginPage from './pages/login';

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
          { path: 'chat', element: <ChatPage /> },
          { path: 'cap-dev', element: <CapDevPage /> },
        ],
      },
      { path: 'login', element: <LoginPage /> },
      { path: 'callback', element: <CallbackPage /> },
    ],
  },
]);

export default router;
