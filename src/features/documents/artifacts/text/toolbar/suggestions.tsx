import { MessageCircleIcon } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import type { ArtifactToolbarItem, ArtifactToolbarContext } from '../../types';

export function createSuggestionsToolbarItem(): ArtifactToolbarItem {
  const { t } = useLanguage();

  return {
    icon: <MessageCircleIcon />,
    description: t('artifact.text.toolbar.suggestions'),
    onClick: ({ appendMessage }: ArtifactToolbarContext) => {
      appendMessage({
        role: 'user',
        content: t('artifact.text.suggestionsPrompt'),
      });
    },
  };
}
