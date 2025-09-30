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

interface ModelIdInputProps {
  form: UseFormReturn<CapFormData>;
}

export function ModelIdInput({ form }: ModelIdInputProps) {
  return (
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
  );
}