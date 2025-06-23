import { RedoIcon } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import type { ArtifactAction } from '../../types';

interface Metadata {
  outputs: Array<any>;
}

export function createRedoAction(): ArtifactAction {
  const { t } = useLanguage();

  return {
    icon: <RedoIcon size={18} />,
    description: t('artifact.code.actions.redo'),
    onClick: ({ handleVersionChange }) => {
      handleVersionChange('next');
    },
    isDisabled: ({ isCurrentVersion }) => {
      if (isCurrentVersion) {
        return true;
      }
      return false;
    },
  };
}
