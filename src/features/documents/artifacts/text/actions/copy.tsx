import { CopyIcon } from 'lucide-react';
import { getLocaleText } from '@/shared/locales';
import { toast } from '@/shared/components/toast';
import type { ArtifactAction } from '../../types';

export function createCopyAction(): ArtifactAction {

  return {
    icon: <CopyIcon size={18} />,
    description: getLocaleText('en').t('artifact.text.actions.copy'),
    onClick: ({ content }) => {
      navigator.clipboard.writeText(content);
      toast({
        description: getLocaleText('en').t('artifact.copied'),
        type: 'success',
      });
    },
  };
}
