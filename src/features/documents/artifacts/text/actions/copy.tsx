import { CopyIcon } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { toast } from '@/components/toast';
import type { ArtifactAction } from '../../types';

export function createCopyAction(): ArtifactAction {
  const { t } = useLanguage();

  return {
    icon: <CopyIcon size={18} />,
    description: t('artifact.text.actions.copy'),
    onClick: ({ content }) => {
      navigator.clipboard.writeText(content);
      toast({
        description: t('artifact.copied'),
        type: 'success',
      });
    },
  };
}
