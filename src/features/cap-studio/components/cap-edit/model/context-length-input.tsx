import type { UseFormReturn } from 'react-hook-form';
import type { CapFormData } from '@/features/cap-studio/hooks/use-edit-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/shared/components/ui';

interface ContextLengthInputProps {
  form: UseFormReturn<CapFormData>;
}

export function ContextLengthInput({ form }: ContextLengthInputProps) {
  return (
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
              onChange={(e) => field.onChange(Number(e.target.value) || null)}
            />
          </FormControl>
          <FormDescription>
            Enter the context length limit of the model
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}