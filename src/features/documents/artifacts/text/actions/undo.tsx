import { UndoIcon } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import type { ArtifactAction } from '../../types';

export function createUndoAction(): ArtifactAction {
  const { t } = useLanguage();

  return {
    icon: <UndoIcon size={18} />,
    description: t('artifact.text.actions.undo'),
    onClick: ({ handleVersionChange }) => {
      handleVersionChange('prev');
    },
    isDisabled: ({ currentVersionIndex }) => {
      return currentVersionIndex === 0;
    },
  };
}
