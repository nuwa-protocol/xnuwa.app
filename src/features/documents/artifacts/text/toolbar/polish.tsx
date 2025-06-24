import { PenIcon } from 'lucide-react';
import { getLocaleText } from '@/shared/locales';
import type { ArtifactToolbarItem, ArtifactToolbarContext } from '../../types';

export function createPolishToolbarItem(): ArtifactToolbarItem {

  return {
    icon: <PenIcon />,
    description: getLocaleText('en').t('artifact.text.toolbar.polish'),
    onClick: ({ appendMessage }: ArtifactToolbarContext) => {
      appendMessage({
        role: 'user',
        content: getLocaleText('en').t('artifact.text.polishPrompt'),
      });
    },
  };
}
