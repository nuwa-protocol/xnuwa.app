import { CopyIcon } from 'lucide-react';
import { toast } from '@/shared/components/toast';
import { getLocaleText } from '@/shared/locales';
import type { ArtifactAction } from '../../types';

interface Metadata {
  outputs: Array<any>;
}

export function createCopyAction(): ArtifactAction<Metadata> {

  return {
    icon: <CopyIcon size={18} />,
    description: getLocaleText('en').t('artifact.code.actions.copy'),
    onClick: ({ content }) => {
      navigator.clipboard.writeText(content);
      toast({
        description: getLocaleText('en').t('artifact.copied'),
        type: 'success',
      });
    },
  };
}
