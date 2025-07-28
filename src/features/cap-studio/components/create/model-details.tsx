import type { Model } from '@/shared/types';
import { getModelName, getProviderName } from '../../utils';
import { ProviderAvatar } from '../model-selector/provider-avatar';

interface ModelDetailsProps {
    model: Model
}

export function ModelDetails({model}: ModelDetailsProps) {
  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/10">
      <ProviderAvatar provider={model.providerName} size="md" />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-base truncate">
          {getModelName(model)}
        </div>
        <div className="text-sm text-muted-foreground truncate">
          {getProviderName(model)}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Context window: {model.context_length?.toLocaleString() || 'Unknown'}{' '}
          tokens
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Pricing: ${model.pricing.input_per_million_tokens}/1M input, $
          {model.pricing.output_per_million_tokens}/1M output
        </div>
      </div>
    </div>
  );
}
