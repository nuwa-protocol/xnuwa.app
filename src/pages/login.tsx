'use client';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConnectButton } from '@/features/auth/components/connect-button';
import { useAuth } from '@/features/auth/hooks';
import { useLanguage } from '@/shared/hooks/use-language';

export default function LoginPage() {
  const navigate = useNavigate();
  const { isConnected } = useAuth();
  const { t } = useLanguage();

  // if already logged in, redirect to home
  useEffect(() => {
    if (isConnected) {
      navigate('/');
    }
  }, [isConnected, navigate]);

  // if already logged in, do not show login form
  if (isConnected) {
    return null;
  }

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">
            {t('login.title')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            {t('login.description')}
          </p>
        </div>
        <ConnectButton />
      </div>
    </div>
  );
}
