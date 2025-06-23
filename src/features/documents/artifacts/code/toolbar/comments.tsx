import { MessageCircleIcon } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import type { ArtifactToolbarItem, ArtifactToolbarContext } from '../../types';

export function createCommentsToolbarItem(): ArtifactToolbarItem {
  const { t } = useLanguage();

  return {
    icon: <MessageCircleIcon />,
    description: t('artifact.code.toolbar.comments'),
    onClick: ({ appendMessage }: ArtifactToolbarContext) => {
      appendMessage({
        role: 'user',
        content: t('artifact.code.addCommentsPrompt'),
      });
    },
  };
}
