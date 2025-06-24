import { SparklesIcon } from 'lucide-react';
import { getLocaleText } from '@/shared/locales';
import type { ArtifactToolbarItem, ArtifactToolbarContext } from '../../types';

export function createFormatToolbarItem(): ArtifactToolbarItem {

  return {
    description: getLocaleText('en').t('artifact.sheet.toolbar.format'),
    icon: <SparklesIcon />,
    onClick: ({ appendMessage }: ArtifactToolbarContext) => {
      appendMessage({
        role: 'user',
        content: getLocaleText('en').t('artifact.sheet.formatPrompt'),
      });
    },
  };
}
