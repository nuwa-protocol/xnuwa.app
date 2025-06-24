import { LineChartIcon } from 'lucide-react';
import { getLocaleText } from '@/shared/locales';
import type { ArtifactToolbarItem, ArtifactToolbarContext } from '../../types';

export function createAnalyzeToolbarItem(): ArtifactToolbarItem {

  return {
    description: getLocaleText('en').t('artifact.sheet.toolbar.analyze'),
    icon: <LineChartIcon />,
    onClick: ({ appendMessage }: ArtifactToolbarContext) => {
      appendMessage({
        role: 'user',
        content: getLocaleText('en').t('artifact.sheet.analyzePrompt'),
      });
    },
  };
}
