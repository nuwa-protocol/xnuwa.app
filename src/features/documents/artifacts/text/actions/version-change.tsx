import { RewindIcon } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import type { ArtifactAction } from '../../types';

export function createVersionChangeAction(): ArtifactAction {
  const { t } = useLanguage();

  return {
    icon: <RewindIcon size={18} />,
    description: t('artifact.text.actions.versionChange'),
    onClick: ({ handleVersionChange }) => {
      handleVersionChange('toggle');
    },
    isDisabled: ({ currentVersionIndex }) => {
      return currentVersionIndex === 0;
    },
  };
}
