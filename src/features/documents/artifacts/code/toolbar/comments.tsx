import { MessageCircleIcon } from 'lucide-react';
import { getLocaleText } from '@/shared/locales';
import type { ArtifactToolbarItem, ArtifactToolbarContext } from '../../types';

export function createCommentsToolbarItem(): ArtifactToolbarItem {

  return {
    icon: <MessageCircleIcon />,
    description: getLocaleText('en').t('artifact.code.toolbar.comments'),
    onClick: ({ appendMessage }: ArtifactToolbarContext) => {
      appendMessage({
        role: 'user',
        content: getLocaleText('en').t('artifact.code.addCommentsPrompt'),
      });
    },
  };
}
