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
import { ArtifactEditor } from './artifact-editor';

interface ArtifactTabProps {
  form: UseFormReturn<CapFormData>;
}

export function ArtifactTab({ form }: ArtifactTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Artifact Configuration</CardTitle>
            <CardDescription>
              This artifact provides interactive UI for your cap
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="core.artifact"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ArtifactEditor
                  value={field.value || { srcUrl: '' }}
                  onChange={(value) => field.onChange(value)}
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
