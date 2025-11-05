import React, { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { ModelDetails } from '@/features/cap-studio/components/cap-edit/model/model-selector/type';
import type { CapFormData } from '@/features/cap-studio/hooks/use-edit-form';
// import { GatewayConfiguration } from './gateway-configuration';
import { ModelConfiguration } from './model-configuration';

interface ModelTabProps {
  form: UseFormReturn<CapFormData>;
}

export function ModelTab({ form }: ModelTabProps) {
  const customGatewayUrl = form.watch('core.model.customGatewayUrl');
  const modelId = form.watch('core.model.modelId');
  const supportedInputs = form.watch('core.model.supportedInputs');
  const providerId = form.watch('core.model.providerId');

  // Initialize states based on form data
  const initialGatewayType = customGatewayUrl ? 'custom' : 'nuwa';
  const hasModelConfig =
    modelId || providerId || (supportedInputs && supportedInputs.length > 0);
  const initialIsConfirmed = customGatewayUrl ? !!hasModelConfig : true;

  const [isGatewayConfirmed, setIsGatewayConfirmed] =
    useState(initialIsConfirmed);
  const [selectedModel, setSelectedModel] = useState<ModelDetails | null>(null);
  const [gatewayType, setGatewayType] = useState<'nuwa' | 'custom'>(
    initialGatewayType,
  );

  const handleGatewayTypeChange = (type: 'nuwa' | 'custom') => {
    setGatewayType(type);
    if (type === 'custom') {
      setSelectedModel(null);
    }
  };

  const handleModelSelect = (model: ModelDetails) => {
    form.setValue('core.model.modelId', model.id);
    form.setValue('core.model.providerId', 'openrouter');
    form.setValue(
      'core.model.supportedInputs',
      (model.supported_inputs as ('text' | 'image' | 'file' | 'audio')[]) || [
        'text',
      ],
    );
    form.setValue('core.model.contextLength', model.contextLength || 0);
    setSelectedModel(model);
  };

  React.useEffect(() => {
    if (customGatewayUrl) {
      if (gatewayType !== 'custom') {
        setGatewayType('custom');
      }
      if (modelId && !isGatewayConfirmed) {
        setIsGatewayConfirmed(true);
      }
    } else {
      if (gatewayType !== 'nuwa') {
        setGatewayType('nuwa');
      }
      setIsGatewayConfirmed(true);
      if (modelId && !selectedModel) {
        setSelectedModel(null);
      }
    }
  }, [
    customGatewayUrl,
    modelId,
    providerId,
    supportedInputs,
    selectedModel,
    gatewayType,
    isGatewayConfirmed,
  ]);

  return (
    <div className="space-y-6">
      {/*
      <GatewayConfiguration
        form={form}
        onGatewayConfirmed={setIsGatewayConfirmed}
        onGatewayTypeChange={handleGatewayTypeChange}
        gatewayType={gatewayType}
        isGatewayConfirmed={isGatewayConfirmed}
      />
      */}
      <ModelConfiguration
        form={form}
        isGatewayConfirmed={isGatewayConfirmed}
        gatewayType={gatewayType}
        selectedModel={selectedModel}
        onModelSelect={handleModelSelect}
      />
    </div>
  );
}
