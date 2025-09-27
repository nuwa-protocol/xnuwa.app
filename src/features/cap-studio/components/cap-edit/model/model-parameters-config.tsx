import React, { useId, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { CapFormData } from '@/features/cap-studio/hooks/use-edit-form';
import {
  Button,
  FormDescription,
  Textarea,
} from '@/shared/components/ui';

interface ModelParametersConfigProps {
  form: UseFormReturn<CapFormData>;
}

export function ModelParametersConfig({ form }: ModelParametersConfigProps) {
  const parametersConfigId = useId();
  const [parametersJson, setParametersJson] = useState<string>('{}');
  const [jsonError, setJsonError] = useState<string>('');
  const parameters = form.watch('core.model.parameters') || {};

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

  React.useEffect(() => {
    if (parameters && Object.keys(parameters).length > 0) {
      setParametersJson(JSON.stringify(parameters, null, 2));
    }
  }, [parameters]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={parametersConfigId} className="text-sm font-medium">
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
          Configure model parameters in JSON format. Click "Use Template" for
          common parameters, or leave empty for default settings.
        </FormDescription>
        <Textarea
          id={parametersConfigId}
          placeholder='{\n  "temperature": 0.7,\n  "top_k": 50,\n  "top_p": 0.9,\n  "max_tokens": 2048\n}'
          value={parametersJson}
          onChange={(e) => handleParametersChange(e.target.value)}
          className="font-mono text-xs min-h-[150px]"
        />
        {jsonError && <p className="text-xs text-red-500">{jsonError}</p>}
      </div>
    </div>
  );
}