import { RemoteMCPManager } from '@/shared/services/global-mcp-manager';
import { initSentry } from '@/shared/services/sentry';
import '@fontsource/geist-mono/400.css';
import '@fontsource/geist-mono/700.css';
import '@fontsource/geist-sans/400.css';
import '@fontsource/geist-sans/500.css';
import '@fontsource/geist-sans/600.css';
import '@fontsource/geist-sans/700.css';
import { Analytics } from "@vercel/analytics/react";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './index.css';
import router from './router.tsx';

// Initialize Sentry
initSentry();

// Setup cleanup on page unload
window.addEventListener('beforeunload', () => {
  const remoteMCPManager = RemoteMCPManager.getInstance();
  remoteMCPManager.cleanup().catch(console.error);
});

// biome-ignore lint/style/noNonNullAssertion: Root element is guaranteed to exist
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Analytics />
    <RouterProvider router={router} />
  </StrictMode>,
);
