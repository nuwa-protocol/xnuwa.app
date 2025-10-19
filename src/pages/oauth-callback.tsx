import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MCP_OAUTH_ORIGIN } from '@/shared/config/mcp-oauth';

export default function CallbackPage() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  useEffect(() => {
    if (!window.opener) {
      return;
    }
    window.opener.postMessage({ type: 'mcp-oauth', code, state }, MCP_OAUTH_ORIGIN);
    window.close();

  }, []);

  return null;
}
