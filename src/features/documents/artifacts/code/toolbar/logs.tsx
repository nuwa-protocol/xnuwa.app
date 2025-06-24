import { LogsIcon } from 'lucide-react';
import { getLocaleText } from '@/shared/locales';
import type { ArtifactToolbarItem, ArtifactToolbarContext } from '../../types';

export function createLogsToolbarItem(): ArtifactToolbarItem {

  return {
    icon: <LogsIcon />,
    description: getLocaleText('en').t('artifact.code.toolbar.logs'),
    onClick: ({ appendMessage }: ArtifactToolbarContext) => {
      appendMessage({
        role: 'user',
        content: getLocaleText('en').t('artifact.code.addLogsPrompt'),
      });
    },
  };
}
