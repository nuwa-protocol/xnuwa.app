import type { UseFormReturn } from 'react-hook-form';
import type { ModelDetails } from '@/features/cap-studio/components/cap-edit/model/model-selector/type';
import type { CapFormData } from '@/features/cap-studio/hooks/use-edit-form';
import { Badge } from '@/shared/components/ui';

interface SelectedModelInfoProps {
  form: UseFormReturn<CapFormData>;
  selectedModel: ModelDetails | null;
}

export function SelectedModelInfo({ form, selectedModel }: SelectedModelInfoProps) {
  const supportedInputs = form.watch('core.model.supportedInputs');
  const providerId = form.watch('core.model.providerId');
  const modelId = form.watch('core.model.modelId');
  const contextLength = form.watch('core.model.contextLength');


  if (!selectedModel) {
    return (
      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Model ID</p>
          <p className="text-sm">{modelId}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Context Length
          </p>
          <p className="text-sm">{contextLength}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Provider ID</p>
          <Badge variant="secondary">{providerId}</Badge>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Supported Inputs
          </p>
          <div className="flex gap-1 flex-wrap">
            {(supportedInputs)?.map(
              (input: string) => (
                <Badge key={input} variant="outline" className="text-xs">
                  {input}
                </Badge>
              ),
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Model ID</p>
        <p className="text-sm">{selectedModel.id}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Context Length
        </p>
        <p className="text-sm">{selectedModel.contextLength}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">Provider ID</p>
        <Badge variant="secondary">openrouter</Badge>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Supported Inputs
        </p>
        <div className="flex gap-1 flex-wrap">
          {(selectedModel.supported_inputs)?.map(
            (input: string) => (
              <Badge key={input} variant="outline" className="text-xs">
                {input}
              </Badge>
            ),
          )}
        </div>
      </div>
    </div>
  );
}