import { UndoIcon } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import type { ArtifactAction } from '../../types';

interface Metadata {
  outputs: Array<any>;
}

export function createUndoAction(): ArtifactAction<Metadata> {
  const { t } = useLanguage();

  return {
    icon: <UndoIcon size={18} />,
    description: t('artifact.code.actions.undo'),
    onClick: ({ handleVersionChange }) => {
      handleVersionChange('prev');
    },
    isDisabled: ({ currentVersionIndex }) => {
      if (currentVersionIndex === 0) {
        return true;
      }
      return false;
    },
  };
}
