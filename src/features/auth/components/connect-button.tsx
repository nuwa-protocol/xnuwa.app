"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { useAuthHandler } from "@/features/auth/hooks/use-auth-handler";
import { Button } from "@/shared/components/ui/button";

export function ConnectButton() {
  const { isConnected, isConnecting } = useAuth();
  const { connect } = useAuthHandler();

  const handleConnect = async () => {
    await connect();
  };

  if (isConnected) return null;

  return (
    <Button onClick={handleConnect} disabled={isConnecting}>
      {isConnecting ? "Connecting…" : "Sign-in with DID"}
    </Button>
  );
}
