import type { Control } from 'react-hook-form';
import {
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
} from '@/shared/components/ui';
import type { SubmitFormData } from '../../hooks/use-submit-form';

interface AuthorFormProps {
  control: Control<SubmitFormData>;
  onFieldChange: (fieldName: keyof SubmitFormData) => void;
}

export function AuthorForm({ control, onFieldChange }: AuthorFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Author</CardTitle>
        <CardDescription>
          Information about the cap author and licensing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="homepage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Homepage (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onFieldChange('homepage');
                  }}
                />
              </FormControl>
              <FormDescription>
                Link to your cap's homepage or documentation
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="repository"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repository (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://github.com/user/repo"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onFieldChange('repository');
                  }}
                />
              </FormControl>
              <FormDescription>
                Link to the source code repository
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
