import { LogsIcon } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import type { ArtifactToolbarItem, ArtifactToolbarContext } from '../../types';

export function createLogsToolbarItem(): ArtifactToolbarItem {
  const { t } = useLanguage();

  return {
    icon: <LogsIcon />,
    description: t('artifact.code.toolbar.logs'),
    onClick: ({ appendMessage }: ArtifactToolbarContext) => {
      appendMessage({
        role: 'user',
        content: t('artifact.code.addLogsPrompt'),
      });
    },
  };
}
