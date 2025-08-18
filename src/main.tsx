import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { GlobalMCPManager } from '@/shared/services/global-mcp-manager';
import router from './router.tsx';
import '@fontsource/geist-sans/400.css';
import '@fontsource/geist-sans/500.css';
import '@fontsource/geist-sans/600.css';
import '@fontsource/geist-sans/700.css';
import '@fontsource/geist-mono/400.css';
import '@fontsource/geist-mono/700.css';

// Setup cleanup on page unload
window.addEventListener('beforeunload', () => {
  const mcpManager = GlobalMCPManager.getInstance();
  mcpManager.cleanup().catch(console.error);
});

// biome-ignore lint/style/noNonNullAssertion: Root element is guaranteed to exist
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
