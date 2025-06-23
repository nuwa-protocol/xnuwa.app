import { UndoIcon } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import type { ArtifactAction } from '../../types';

type Metadata = any;

export function createUndoAction(): ArtifactAction<Metadata> {
  const { t } = useLanguage();

  return {
    icon: <UndoIcon size={18} />,
    description: t('artifact.sheet.actions.undo'),
    onClick: ({ handleVersionChange }) => {
      handleVersionChange('prev');
    },
    isDisabled: ({ currentVersionIndex }) => {
      return currentVersionIndex === 0;
    },
  };
}
