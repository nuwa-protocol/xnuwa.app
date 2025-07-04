import { Clock, DollarSign, Zap } from 'lucide-react';
import type React from 'react';
import { useId } from 'react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { useLocale } from '@/shared/locales/use-locale';
import type { Model } from '../types';
import type { Category } from '../utils';
import { ModelCard } from './model-card';

interface AutoSettingsProps {
  categories: Category[];
  autoFocusCategory: string | null;
  autoOptimizationMetric: 'speed' | 'cost' | 'latency';
  autoAdvancedSettings: boolean;
  recommendedModels: Model[];
  selectedModel: Model | null;
  onFocusCategoryChange: (category: string | null) => void;
  onOptimizationMetricChange: (metric: 'speed' | 'cost' | 'latency') => void;
  onAdvancedSettingsChange: (enabled: boolean) => void;
  onModelSelect: (model: Model) => void;
}

export const AutoSettings: React.FC<AutoSettingsProps> = ({
  categories,
  autoFocusCategory,
  autoOptimizationMetric,
  autoAdvancedSettings,
  recommendedModels,
  selectedModel,
  onFocusCategoryChange,
  onOptimizationMetricChange,
  onAdvancedSettingsChange,
  onModelSelect,
}) => {
  const { t } = useLocale();
  const speedId = useId();
  const costId = useId();
  const latencyId = useId();
  const advancedSettingsId = useId();
  const minContextId = useId();

  return (
    <div className="space-y-6 -mt-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">
          {t('aiProvider.autoSettings.focusCategory.title')}
        </h3>
        <Select
          onValueChange={(val) =>
            onFocusCategoryChange(val === 'none' ? null : val)
          }
          value={autoFocusCategory ?? 'none'}
        >
          <SelectTrigger className="w-[240px]">
            <SelectValue
              placeholder={t(
                'aiProvider.autoSettings.focusCategory.placeholder',
              )}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              {t('aiProvider.autoSettings.focusCategory.none')}
            </SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">
          {t('aiProvider.autoSettings.optimizeFor.title')}
        </h3>
        <RadioGroup
          defaultValue="speed"
          value={autoOptimizationMetric}
          onValueChange={onOptimizationMetricChange}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="speed" id={speedId} />
            <Label htmlFor={speedId} className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />{' '}
              {t('aiProvider.autoSettings.optimizeFor.speed')}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cost" id={costId} />
            <Label htmlFor={costId} className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />{' '}
              {t('aiProvider.autoSettings.optimizeFor.cost')}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="latency" id={latencyId} />
            <Label htmlFor={latencyId} className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />{' '}
              {t('aiProvider.autoSettings.optimizeFor.latency')}
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor={advancedSettingsId} className="text-lg font-semibold">
          {t('aiProvider.autoSettings.advancedSettings.title')}
        </Label>
        <Switch
          id={advancedSettingsId}
          checked={autoAdvancedSettings}
          onCheckedChange={onAdvancedSettingsChange}
        />
      </div>

      {autoAdvancedSettings && (
        <div className="border border-border rounded-lg p-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('aiProvider.autoSettings.advancedSettings.description')}
          </p>
          <div>
            <Label htmlFor={minContextId}>
              {t('aiProvider.autoSettings.advancedSettings.minContextLength')}
            </Label>
            <Input
              id={minContextId}
              type="number"
              placeholder={t(
                'aiProvider.autoSettings.advancedSettings.contextPlaceholder',
              )}
              className="w-40 mt-1"
            />
          </div>
        </div>
      )}

      <h3 className="text-lg font-semibold pt-4">
        {t('aiProvider.autoSettings.recommendedModels')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendedModels.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            isSelected={selectedModel?.id === model.id}
            onClick={onModelSelect}
          />
        ))}
      </div>
    </div>
  );
};
