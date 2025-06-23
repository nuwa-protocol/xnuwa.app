import { LineChartIcon } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import type { ArtifactToolbarItem, ArtifactToolbarContext } from '../../types';

export function createAnalyzeToolbarItem(): ArtifactToolbarItem {
  const { t } = useLanguage();

  return {
    description: t('artifact.sheet.toolbar.analyze'),
    icon: <LineChartIcon />,
    onClick: ({ appendMessage }: ArtifactToolbarContext) => {
      appendMessage({
        role: 'user',
        content: t('artifact.sheet.analyzePrompt'),
      });
    },
  };
}
