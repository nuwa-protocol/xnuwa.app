import React, { useId, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { ModelDetails } from '@/features/cap-studio/components/cap-edit/model/model-selector/type';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Textarea,
} from '@/shared/components/ui';
import { LLM_GATEWAY_BASE_URL } from '@/shared/config/llm-gateway';
import { ModelSelectorDialog } from './model-selector';

interface ModelTabProps {
  form: UseFormReturn<any>;
}

export function ModelTab({ form }: ModelTabProps) {
  const nuwaGatewayId = useId();
  const customGatewayId = useId();
  const parametersConfigId = useId();
  const customParametersId = useId();

  const customGatewayUrl = form.watch('core.model.customGatewayUrl');
  const modelId = form.watch('core.model.modelId');
  const parameters = form.watch('core.model.parameters') || {};
  const supportedInputs = form.watch('core.model.supportedInputs');
  const modelType = form.watch('core.model.modelType');
  const contextLength = form.watch('core.model.contextLength');

  // Initialize states based on form data
  const initialGatewayType = customGatewayUrl ? 'custom' : 'nuwa';
  // For custom gateway, confirm if we have any model configuration (not just modelId)
  const hasModelConfig =
    modelId || modelType || (supportedInputs && supportedInputs.length > 0);
  const initialIsConfirmed = customGatewayUrl
    ? !!hasModelConfig
    : true; // Nuwa gateway is always confirmed

  const [isGatewayConfirmed, setIsGatewayConfirmed] =
    useState(initialIsConfirmed);
  const [isValidatingGateway, setIsValidatingGateway] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelDetails | null>(null);
  const [parametersJson, setParametersJson] = useState<string>('{}');
  const [jsonError, setJsonError] = useState<string>('');
  const [gatewayType, setGatewayType] = useState<'nuwa' | 'custom'>(
    initialGatewayType,
  );

  const handleGatewayTypeChange = (field: any, type: 'nuwa' | 'custom') => {
    if (type === 'nuwa') {
      // For Nuwa gateway, clear the customGatewayUrl field
      field.onChange(undefined);
      setGatewayType('nuwa');
    } else {
      // Set a default URL for custom gateway to avoid immediate validation errors
      field.onChange('https://api.openai.com/v1');
      setGatewayType('custom');
      // Reset model fields when switching to custom
      form.setValue('core.model.modelId', '');
      form.setValue('core.model.modelType', 'Language Model');
      form.setValue('core.model.supportedInputs', ['text']);
      form.setValue('core.model.parameters', {});
      form.setValue('core.model.contextLength', 0);
      setSelectedModel(null);
    }
    setIsGatewayConfirmed(type === 'nuwa'); // Nuwa gateway is always confirmed
  };

  const handleTestGateway = async () => {
    if (gatewayType === 'custom') {
      setIsValidatingGateway(true);
      try {
        // TODO: Implement custom gateway validation
        const isValid = await validateCustomGateway(customGatewayUrl);
        if (isValid) {
          setIsGatewayConfirmed(true);
        } else {
          console.error('Gateway validation failed');
        }
      } catch (error) {
        console.error('Gateway validation error:', error);
      } finally {
        setIsValidatingGateway(false);
      }
    } else {
      // Nuwa gateway doesn't need validation
      setIsGatewayConfirmed(true);
    }
  };

  // This function should validate that the custom gateway URL is accessible
  // and supports the expected API endpoints
  const validateCustomGateway = async (url: string): Promise<boolean> => {
    // Placeholder implementation
    // In the future, this should:
    // 1. Check if the URL is reachable
    // 2. Verify it has the expected API endpoints (e.g., /v1/models)
    // 3. Test authentication if required
    // 4. Return true if valid, false otherwise

    // For now, simulate async validation with a delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Temporary: accept all URLs that look like valid URLs
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleModelSelect = (model: ModelDetails) => {
    form.setValue('core.model.modelId', model.id);
    form.setValue('core.model.modelType', 'Language Model');
    form.setValue(
      'core.model.supportedInputs',
      model.supported_inputs || ['text'],
    );
    form.setValue('core.model.contextLength', model.contextLength || 0);
    setSelectedModel(model);
  };

  const defaultParameterTemplate = `{
  "temperature": 0.7,
  "top_k": 50,
  "top_p": 0.9,
  "max_tokens": 2048,
  "presence_penalty": 0,
  "frequency_penalty": 0
}`;

  const handleParametersChange = (value: string) => {
    setParametersJson(value);
    try {
      const parsed = JSON.parse(value || '{}');
      form.setValue('core.model.parameters', parsed);
      setJsonError('');
    } catch (error) {
      setJsonError('Invalid JSON format');
    }
  };

  const handleUseTemplate = () => {
    setParametersJson(defaultParameterTemplate);
    try {
      const parsed = JSON.parse(defaultParameterTemplate);
      form.setValue('core.model.parameters', parsed);
      setJsonError('');
    } catch (error) {
      setJsonError('Invalid template format');
    }
  };

  // Initialize states based on existing data
  React.useEffect(() => {
    if (customGatewayUrl) {
      if (gatewayType !== 'custom') {
        setGatewayType('custom');
      }
      // For custom gateway, confirm if we already have model configuration
      // This indicates the gateway was previously validated
      if (modelId && !isGatewayConfirmed) {
        setIsGatewayConfirmed(true);
      }
    } else {
      if (gatewayType !== 'nuwa') {
        setGatewayType('nuwa');
      }
      setIsGatewayConfirmed(true); // Nuwa gateway is always trusted
      // If we have a modelId but no selectedModel, set it to null
      if (modelId && !selectedModel) {
        setSelectedModel(null);
      }
    }
  }, [
    customGatewayUrl,
    modelId,
    modelType,
    supportedInputs,
    selectedModel,
    gatewayType,
    isGatewayConfirmed,
    contextLength,
  ]);

  // Initialize parameters JSON from form value
  React.useEffect(() => {
    if (parameters && Object.keys(parameters).length > 0) {
      setParametersJson(JSON.stringify(parameters, null, 2));
    }
  }, [parameters]);

  return (
    <>
      {/* Gateway Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gateway Configuration</CardTitle>
          <CardDescription>
            Choose your LLM gateway for this cap
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="core.model.customGatewayUrl"
              render={({ field }) => (
                <FormItem className="ml-6">
                  <FormLabel className="sr-only">Custom Gateway URL</FormLabel>
                  <FormControl>
                    <div className="flex flex-col space-y-2">
                      <RadioGroup
                        value={gatewayType}
                        onValueChange={(value: 'nuwa' | 'custom') => {
                          handleGatewayTypeChange(field, value);
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="nuwa" id={nuwaGatewayId} />
                          <label
                            htmlFor={nuwaGatewayId}
                            className="text-sm font-medium cursor-pointer"
                          >
                            Nuwa LLM Gateway (Default)
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="custom" id={customGatewayId} />
                          <label
                            htmlFor={customGatewayId}
                            className="text-sm font-medium cursor-pointer"
                          >
                            Custom Gateway
                          </label>
                        </div>
                      </RadioGroup>
                      <Input
                        className={`${gatewayType === 'nuwa' ? 'hidden' : ''}`}
                        placeholder="Enter gateway URL (e.g., https://gateway.example.com/v1)"
                        value={field.value || ''}
                        onChange={field.onChange}
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="sr-only">
                    Enter the base URL for your custom LLM gateway
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {
            gatewayType === 'custom' && (
              <div className="flex items-center justify-between pt-2 px-6">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleTestGateway}
                  disabled={
                    !customGatewayUrl?.trim() ||
                    isValidatingGateway
                  }
                >
                  {isValidatingGateway ? 'Testing...' : 'Test Gateway'}
                </Button>
              </div>
            )
          }
        </CardContent>
      </Card>

      {/* Model Configuration */}
      <Card>
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
                onModelSelect={handleModelSelect}
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
            // Nuwa Gateway Mode - Show selected model info
            <div className="space-y-4">
              {!selectedModel ? (
                <div className="text-muted-foreground text-sm">
                  No model selected. Click "Select Model" to choose one.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Model ID
                      </p>
                      <p className="text-sm">{selectedModel.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Context Length
                      </p>
                      <p className="text-sm">{selectedModel.contextLength}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Provider
                      </p>
                      <p className="text-sm">{selectedModel.providerName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Model Type
                      </p>
                      <Badge variant="secondary">{modelType}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Supported Inputs
                      </p>
                      <div className="flex gap-1 flex-wrap">
                        {(
                          selectedModel.supported_inputs || supportedInputs
                        )?.map((input: string) => (
                          <Badge
                            key={input}
                            variant="outline"
                            className="text-xs"
                          >
                            {input}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor={parametersConfigId}
                        className="text-sm font-medium"
                      >
                        Model Parameters
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleUseTemplate}
                        className="text-xs"
                      >
                        Use Template
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <FormDescription className="text-xs">
                        Configure model parameters in JSON format. Click "Use
                        Template" for common parameters, or leave empty for
                        default settings.
                      </FormDescription>
                      <Textarea
                        id={parametersConfigId}
                        placeholder='{\n  "temperature": 0.7,\n  "top_k": 50,\n  "top_p": 0.9,\n  "max_tokens": 2048\n}'
                        value={parametersJson}
                        onChange={(e) => handleParametersChange(e.target.value)}
                        className="font-mono text-xs min-h-[150px]"
                      />
                      {jsonError && (
                        <p className="text-xs text-red-500">{jsonError}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Custom Gateway Mode - Manual configuration
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="core.model.modelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., gpt-4o, claude-3-5-sonnet-20241022"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the exact model identifier used by your gateway
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="core.model.contextLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Context Length</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 128000"
                        type="number"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the context length limit of the model
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="core.model.modelType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model Type</FormLabel>
                    <FormControl>
                      <Input
                        value="Language Model"
                        disabled
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormDescription>
                      Custom gateways only support Language Models. We plan to
                      support more model types in the future.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="core.model.supportedInputs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supported Inputs</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value?.[0] || 'text'}
                        onValueChange={(value) => {
                          const currentInputs = field.value || ['text'];
                          if (
                            value === 'text' &&
                            !currentInputs.includes('text')
                          ) {
                            field.onChange([...currentInputs, 'text']);
                          } else if (
                            value !== 'text' &&
                            !currentInputs.includes(value)
                          ) {
                            field.onChange([...currentInputs, value]);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue>
                            {field.value?.join(', ') || 'text'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text (Required)</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Select the input types your model supports (text is
                      required)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor={customParametersId}
                    className="text-sm font-medium"
                  >
                    Model Parameters
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUseTemplate}
                    className="text-xs"
                  >
                    Use Template
                  </Button>
                </div>
                <FormDescription className="text-xs mb-2">
                  Configure model parameters in JSON format. Click "Use
                  Template" for common parameters, or leave empty for default
                  settings.
                </FormDescription>
                <Textarea
                  id={customParametersId}
                  placeholder='{\n  "temperature": 0.7,\n  "top_k": 50,\n  "top_p": 0.9,\n  "max_tokens": 2048\n}'
                  value={parametersJson}
                  onChange={(e) => handleParametersChange(e.target.value)}
                  className="font-mono text-xs min-h-[150px]"
                />
                {jsonError && (
                  <p className="text-xs text-red-500 mt-1">{jsonError}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
