import { CopyIcon } from 'lucide-react';
import { toast } from '@/components/toast';
import { useLanguage } from '@/hooks/use-language';
import type { ArtifactAction } from '../../types';

interface Metadata {
  outputs: Array<any>;
}

export function createCopyAction(): ArtifactAction<Metadata> {
  const { t } = useLanguage();

  return {
    icon: <CopyIcon size={18} />,
    description: t('artifact.code.actions.copy'),
    onClick: ({ content }) => {
      navigator.clipboard.writeText(content);
      toast({
        description: t('artifact.copied'),
        type: 'success',
      });
    },
  };
}
