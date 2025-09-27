import type { UseFormReturn } from 'react-hook-form';
import type { ModelDetails } from '@/features/cap-studio/components/cap-edit/model/model-selector/type';
import type { CapFormData } from '@/features/cap-studio/hooks/use-edit-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from '@/shared/components/ui';
import { LLM_GATEWAY_BASE_URL } from '@/shared/config/llm-gateway';
import { ContextLengthInput } from './context-length-input';
import { ModelIdInput } from './model-id-input';
import { ModelParametersConfig } from './model-parameters-config';
import { ModelSelectorDialog } from './model-selector';
import { ProviderIdSelector } from './provider-id-selector';
import { SelectedModelInfo } from './selected-model-info';
import { SupportedInputsSelector } from './supported-inputs-selector';

interface ModelConfigurationProps {
  form: UseFormReturn<CapFormData>;
  isGatewayConfirmed: boolean;
  gatewayType: 'nuwa' | 'custom';
  selectedModel: ModelDetails | null;
  onModelSelect: (model: ModelDetails) => void;
}

export function ModelConfiguration({
  form,
  isGatewayConfirmed,
  gatewayType,
  selectedModel,
  onModelSelect,
}: ModelConfigurationProps) {
  return (
    <Card className='mt-6'>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Model Configuration</CardTitle>
            <CardDescription>
              {gatewayType === 'nuwa'
                ? 'Choose the AI model for your cap'
                : 'Manually configure your model settings'}
            </CardDescription>
          </div>
          {isGatewayConfirmed && gatewayType === 'nuwa' && (
            <ModelSelectorDialog
              gatewayUrl={LLM_GATEWAY_BASE_URL}
              onModelSelect={onModelSelect}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isGatewayConfirmed ? (
          <div className="text-muted-foreground text-sm">
            Please test your gateway first
          </div>
        ) : gatewayType === 'nuwa' ? (
          <div className="space-y-4">
            {selectedModel && (
              <div className="space-y-3">
                <SelectedModelInfo form={form} selectedModel={selectedModel} />
                <Separator />
                <ModelParametersConfig form={form} />
              </div>
            )}
          </div>
        ) : (
          <div>
            <ModelIdInput form={form} />
            <ContextLengthInput form={form} />
            <ProviderIdSelector form={form} />
            <SupportedInputsSelector form={form} />
            <ModelParametersConfig form={form} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
