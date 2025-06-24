import { MessageCircleIcon } from 'lucide-react';
import { getLocaleText } from '@/shared/locales';
import type { ArtifactToolbarItem, ArtifactToolbarContext } from '../../types';

export function createSuggestionsToolbarItem(): ArtifactToolbarItem {

  return {
    icon: <MessageCircleIcon />,
    description: getLocaleText('en').t('artifact.text.toolbar.suggestions'),
    onClick: ({ appendMessage }: ArtifactToolbarContext) => {
      appendMessage({
        role: 'user',
        content: getLocaleText('en').t('artifact.text.suggestionsPrompt'),
      });
    },
  };
}
