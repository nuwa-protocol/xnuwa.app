'use client';

import { useLanguage } from '@/shared/hooks/use-language';

export default function Loading() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full size-8 border-b-2 border-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{t('chat.loadingChat')}</p>
        </div>
      </div>
    </div>
  );
}
