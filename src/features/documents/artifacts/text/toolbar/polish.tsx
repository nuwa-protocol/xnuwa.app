import { PenIcon } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import type { ArtifactToolbarItem, ArtifactToolbarContext } from '../../types';

export function createPolishToolbarItem(): ArtifactToolbarItem {
  const { t } = useLanguage();

  return {
    icon: <PenIcon />,
    description: t('artifact.text.toolbar.polish'),
    onClick: ({ appendMessage }: ArtifactToolbarContext) => {
      appendMessage({
        role: 'user',
        content: t('artifact.text.polishPrompt'),
      });
    },
  };
}
