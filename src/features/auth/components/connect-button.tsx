'use client';

import { Button } from '@/components/ui/button';

import { useAuth } from '@/hooks/use-auth';
import { useAuthHandler } from '@/hooks/use-auth-handler';

export function ConnectButton() {
  const { isConnected, isConnecting } = useAuth();
  const { connect } = useAuthHandler();

  const handleConnect = async () => {
    await connect();
  };

  if (isConnected) return null;

  return (
    <Button onClick={handleConnect} disabled={isConnecting}>
      {isConnecting ? 'Connecting…' : 'Sign-in with DID'}
    </Button>
  );
}
