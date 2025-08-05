import { KeyRound, Loader2 } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useAuthHandler } from '@/features/auth/hooks/use-auth-handler';
import { Button } from '@/shared/components/ui/button';

export function ConnectButton() {
  const { isConnected, isConnecting } = useAuth();
  const { connect } = useAuthHandler();

  const handleConnect = async () => {
    await connect();
  };

  if (isConnected) return null;

  return (
    <div className="space-y-4">
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        size="lg"
        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 group border-0"
      >
        {isConnecting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            Sign in with DID
            <KeyRound className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
          </>
        )}
      </Button>

      <div className="flex items-center justify-center space-x-4 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <span>Secure</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: '#FF15FB' }}
          ></div>
          <span>Decentralized</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-purple-400"></div>
          <span>Private</span>
        </div>
      </div>
    </div>
  );
}
