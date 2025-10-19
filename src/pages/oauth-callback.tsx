import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Logo } from '@/shared/components/logo';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { MCP_OAUTH_ORIGIN } from '@/shared/config/mcp-oauth';

export default function CallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const [status, setStatus] = useState<'processing' | 'success' | 'error'>(
    'processing',
  );
  const [message, setMessage] = useState('Processing authorization…');

  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) {
      return;
    }

    processedRef.current = true;

    const process = async () => {
      try {

        setStatus('success');
        setMessage('Authorization successful!');

        if (window.opener) {
          window.opener.postMessage({ type: 'mcp-oauth', code, state }, MCP_OAUTH_ORIGIN);
          setTimeout(() => window.close(), 1500);
        } else {
          // small delay to let provider autoConnect pick up
          setTimeout(() => navigate('/'), 500);
        }
      } catch (err) {
        console.error('DID callback error:', err);
        setStatus('error');
        setMessage(
          err instanceof Error
            ? err.message
            : 'Failed to process authorization.',
        );
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    process();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-fuchsia-100 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-pink-200/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-fuchsia-200/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-purple-100/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <Card className="shadow-xl border border-white/50 bg-white/90 backdrop-blur-md">
          <CardHeader className="text-center space-y-6 pb-8">
            {/* Logo */}
            <div className="flex justify-center">
              <Logo autoTheme={false} />
            </div>
          </CardHeader>

          <CardContent className="pb-8 text-center">
            <h1 className="text-xl font-semibold mb-4">
              {status === 'processing' && 'Processing…'}
              {status === 'success' && 'Success'}
              {status === 'error' && 'Error'}
            </h1>
            <p className="text-sm text-muted-foreground mb-4">{message}</p>
            {status === 'error' && (
              <button
                type="button"
                className="text-sm underline hover:no-underline transition-all"
                onClick={() => window.close()}
              >
                Close
              </button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
