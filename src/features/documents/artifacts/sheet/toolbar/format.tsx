import { SparklesIcon } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import type { ArtifactToolbarItem, ArtifactToolbarContext } from '../../types';

export function createFormatToolbarItem(): ArtifactToolbarItem {
  const { t } = useLanguage();

  return {
    description: t('artifact.sheet.toolbar.format'),
    icon: <SparklesIcon />,
    onClick: ({ appendMessage }: ArtifactToolbarContext) => {
      appendMessage({
        role: 'user',
        content: t('artifact.sheet.formatPrompt'),
      });
    },
  };
}
