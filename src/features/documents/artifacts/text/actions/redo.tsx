import { RedoIcon } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import type { ArtifactAction } from '../../types';

export function createRedoAction(): ArtifactAction {
  const { t } = useLanguage();

  return {
    icon: <RedoIcon size={18} />,
    description: t('artifact.text.actions.redo'),
    onClick: ({ handleVersionChange }) => {
      handleVersionChange('next');
    },
    isDisabled: ({ isCurrentVersion }) => {
      return isCurrentVersion;
    },
  };
}
