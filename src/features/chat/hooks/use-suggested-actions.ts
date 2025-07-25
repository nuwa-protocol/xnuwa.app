import { useLanguage } from '@/shared/hooks/use-language';

export interface SuggestedAction {
  title: string;
  action: string;
}

export function useSuggestedActions(): SuggestedAction[] {
  const { t } = useLanguage();
  
  const suggestedActions = t('suggestedActions') as Array<SuggestedAction>;
  
  return suggestedActions;
} 