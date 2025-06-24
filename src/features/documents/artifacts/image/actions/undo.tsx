import { UndoIcon } from 'lucide-react';
import { getLocaleText } from '@/shared/locales';
import type { ArtifactAction } from '../../types';

export function createUndoAction(): ArtifactAction {

  return {
    icon: <UndoIcon size={18} />,
    description: getLocaleText('en').t('artifact.image.actions.undo'),
    onClick: ({ handleVersionChange }) => {
      handleVersionChange('prev');
    },
    isDisabled: ({ currentVersionIndex }) => {
      return currentVersionIndex === 0;
    },
  };
}
