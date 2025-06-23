'use client';

import { useLanguage } from '@/hooks/use-language';

export function Logo() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-row gap-3 items-center text-lg font-semibold px-2 rounded-md">
      {t('logo')}
    </div>
  );
}
