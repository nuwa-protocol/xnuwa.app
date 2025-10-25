import { useEffect } from 'react';
import { CreateAccountButton } from '@/features/auth/components/create-account-button';
import { AccountStore } from '@/features/auth/store';
import { Logo } from '@/shared/components/logo';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';

export default function LoginPage() {
  const { account } = AccountStore();

  // if already logged in, redirect to home
  useEffect(() => {
    if (account !== null) {
      window.location.replace('/');
    }
  }, [account]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-fuchsia-100 dark:from-gray-900 dark:via-purple-900 dark:to-fuchsia-900 p-4 relative">
      <div className="relative w-full max-w-md">
        <Card className="shadow-xl rounded-3xl border border-white/50 bg-white/90 backdrop-blur-md dark:border-gray-800/50 dark:bg-gray-900/70 dark:backdrop-blur-md">
          <CardHeader className="text-center space-y-6 pb-8">
            {/* Logo */}
            <div className="flex justify-center">
              <Logo />
            </div>

            {/* Title with icon */}
          </CardHeader>

          <CardContent className="pb-8">
            <CreateAccountButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
