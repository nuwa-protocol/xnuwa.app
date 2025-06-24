import { RedoIcon } from 'lucide-react';
import { getLocaleText } from '@/shared/locales';
import type { ArtifactAction } from '../../types';

export function createRedoAction(): ArtifactAction {

  return {
    icon: <RedoIcon size={18} />,
    description: getLocaleText('en').t('artifact.text.actions.redo'),
    onClick: ({ handleVersionChange }) => {
      handleVersionChange('next');
    },
    isDisabled: ({ isCurrentVersion }) => {
      return isCurrentVersion;
    },
  };
}
