'use client';

import { useFormStatus } from 'react-dom';
import { LoaderIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useLanguage } from '@/shared/hooks/use-language';

export function SubmitButton({
  children,
  isSuccessful,
}: {
  children: React.ReactNode;
  isSuccessful: boolean;
}) {
  const { pending } = useFormStatus();
  const { t } = useLanguage();

  return (
    <Button
      type={pending ? 'button' : 'submit'}
      aria-disabled={pending || isSuccessful}
      disabled={pending || isSuccessful}
      className="relative"
    >
      {children}

      {(pending || isSuccessful) && (
        <span className="animate-spin absolute right-4">
          <LoaderIcon />
        </span>
      )}

      <output aria-live="polite" className="sr-only">
        {pending || isSuccessful ? t('submit.loading') : t('submit.submit')}
      </output>
    </Button>
  );
}
