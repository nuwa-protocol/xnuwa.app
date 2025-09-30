import type { UseFormReturn } from 'react-hook-form';
import type { CapFormData } from '@/features/cap-studio/hooks/use-edit-form';
import { FormField, FormItem } from '@/shared/components/ui';
import { McpServersConfig } from './mcp-servers-config';

interface McpTabProps {
  form: UseFormReturn<CapFormData>;
}

export function McpTab({ form }: McpTabProps) {
  return (
    <FormField
      control={form.control}
      name="core.mcpServers"
      render={({ field }) => (
        <FormItem>
          <McpServersConfig
            mcpServers={field.value || {}}
            onUpdateMcpServers={field.onChange}
          />
        </FormItem>
      )}
    />
  );
}
