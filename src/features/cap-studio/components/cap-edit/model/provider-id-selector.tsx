import type { UseFormReturn } from 'react-hook-form';
import type { CapFormData } from '@/features/cap-studio/hooks/use-edit-form';
import {
  Badge,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui';
import { SUPPORTED_PROVIDERS } from '@/shared/constants/cap';

interface ProviderIdSelectorProps {
  form: UseFormReturn<CapFormData>;
}

export function ProviderIdSelector({ form }: ProviderIdSelectorProps) {
  return (
    <FormField
      control={form.control}
      name="core.model.providerId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Provider ID</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Object.entries(SUPPORTED_PROVIDERS).map(([providerId, provider]) => (
                <SelectItem key={providerId} value={providerId}>
                  <div className="flex items-center gap-2">
                    <img
                      src={provider.icon}
                      alt={provider.name}
                      className="w-4 h-4 flex-shrink-0"
                    />
                    <span className="flex-1">{provider.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {providerId}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            Select the AI provider for your model. Each provider offers different models and capabilities.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}