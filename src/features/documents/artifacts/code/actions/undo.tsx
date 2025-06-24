import { UndoIcon } from 'lucide-react';
import { getLocaleText } from '@/shared/locales';
import type { ArtifactAction } from '../../types';

interface Metadata {
  outputs: Array<any>;
}

export function createUndoAction(): ArtifactAction<Metadata> {

  return {
    icon: <UndoIcon size={18} />,
    description: getLocaleText('en').t('artifact.code.actions.undo'),
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
