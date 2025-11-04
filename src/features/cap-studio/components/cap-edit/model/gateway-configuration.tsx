import { useId, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { CapFormData } from '@/features/cap-studio/hooks/use-edit-form';
import {
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
} from '@/shared/components/ui';

interface GatewayConfigurationProps {
  form: UseFormReturn<CapFormData>;
  onGatewayConfirmed: (confirmed: boolean) => void;
  onGatewayTypeChange: (type: 'nuwa' | 'custom') => void;
  gatewayType: 'nuwa' | 'custom';
  isGatewayConfirmed: boolean;
}

export function GatewayConfiguration({
  form,
  onGatewayConfirmed,
  onGatewayTypeChange,
  gatewayType,
  isGatewayConfirmed,
}: GatewayConfigurationProps) {
  const nuwaGatewayId = useId();
  const customGatewayId = useId();
  const [isValidatingGateway, setIsValidatingGateway] = useState(false);

  const customGatewayUrl = form.watch('core.model.customGatewayUrl');

  const handleGatewayTypeChange = (field: any, type: 'nuwa' | 'custom') => {
    if (type === 'nuwa') {
      field.onChange(undefined);
      onGatewayTypeChange('nuwa');
    } else {
      field.onChange('https://api.openai.com/v1');
      onGatewayTypeChange('custom');
      // Reset model fields when switching to custom
      form.setValue('core.model.modelId', '');
      form.setValue('core.model.providerId', 'openrouter');
      form.setValue('core.model.supportedInputs', ['text']);
      form.setValue('core.model.parameters', {});
      form.setValue('core.model.contextLength', 0);
    }
    onGatewayConfirmed(type === 'nuwa');
  };

  const validateCustomGateway = async (url: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleTestGateway = async () => {
    if (gatewayType === 'custom' && customGatewayUrl) {
      setIsValidatingGateway(true);
      try {
        const isValid = await validateCustomGateway(customGatewayUrl);
        if (isValid) {
          onGatewayConfirmed(true);
        } else {
          console.error('Gateway validation failed');
        }
      } catch (error) {
        console.error('Gateway validation error:', error);
      } finally {
        setIsValidatingGateway(false);
      }
    } else {
      onGatewayConfirmed(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Gateway Configuration</CardTitle>
        <CardDescription>
          Choose your LLM gateway for this agent. You can provide your own
          custom LLM gateway URL.
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
                          Nuwa LLM Gateway{' '}
                          <span className="text-xs text-muted-foreground">
                            (Use OpenRouter for LLM provider)
                          </span>
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

        {gatewayType === 'custom' && (
          <div className="flex items-center justify-between pt-2 px-6">
            <Button
              type="button"
              size="sm"
              onClick={handleTestGateway}
              disabled={!customGatewayUrl?.trim() || isValidatingGateway}
            >
              {isValidatingGateway ? 'Testing...' : 'Test Gateway'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
