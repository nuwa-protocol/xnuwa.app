import type { UseFormReturn } from 'react-hook-form';
import type { CapFormData } from '@/features/cap-studio/hooks/use-edit-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/shared/components/ui';
import { PromptEditor } from './prompt-editor';

interface PromptTabProps {
  form: UseFormReturn<CapFormData>;
}

export function PromptTab({ form }: PromptTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Prompt Configuration</CardTitle>
            <CardDescription>
              This prompt will guide the AI model's behavior when using your agent
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="core.prompt"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PromptEditor
                  value={field.value.value}
                  onChange={(value) =>
                    field.onChange({ ...field.value, value })
                  }
                  suggestions={field.value.suggestions || []}
                  onSuggestionsChange={(suggestions) =>
                    field.onChange({ ...field.value, suggestions })
                  }
                  placeholder="Enter your prompt instructions here..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
