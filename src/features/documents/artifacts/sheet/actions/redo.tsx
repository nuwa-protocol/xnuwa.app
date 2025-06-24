import { RedoIcon } from 'lucide-react';
import { getLocaleText } from '@/shared/locales';
import type { ArtifactAction } from '../../types';

type Metadata = any;

export function createRedoAction(): ArtifactAction<Metadata> {

  return {
    icon: <RedoIcon size={18} />,
    description: getLocaleText('en').t('artifact.sheet.actions.redo'),
    onClick: ({ handleVersionChange }) => {
      handleVersionChange('next');
    },
    isDisabled: ({ isCurrentVersion }) => {
      return isCurrentVersion;
    },
  };
}
