import { RedoIcon } from 'lucide-react';
import { getLocaleText } from '@/shared/locales';
import type { ArtifactAction } from '../../types';

interface Metadata {
  outputs: Array<any>;
}

export function createRedoAction(): ArtifactAction {
  return {
    icon: <RedoIcon size={18} />,
    description: getLocaleText('en').t('artifact.code.actions.redo'),
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
