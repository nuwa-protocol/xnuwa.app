import { useCurrentCap } from '@/shared/hooks/use-current-cap';

export interface SuggestedAction {
  title: string;
  action: string;
}

export function useSuggestedActions(): SuggestedAction[] {
  const { currentCap: cap } = useCurrentCap();

  const suggestedActions =
    cap?.prompt.suggestions?.map((suggestion) => ({
      title: suggestion,
      action: suggestion,
    })) || [];

  return suggestedActions;
}
