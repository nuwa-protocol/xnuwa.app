import type { UseFormReturn } from 'react-hook-form';
import type { CapFormData } from '@/features/cap-studio/hooks/use-edit-form';
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
import { DashboardGrid } from '../../layout/dashboard-layout';
import { CapTags } from './cap-tags';
import { ThumbnailUpload } from './thumbnail-upload';

interface GeneralTabProps {
  form: UseFormReturn<CapFormData>;
}

export function GeneralTab({ form }: GeneralTabProps) {
  return (
    <DashboardGrid cols={1}>
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
          <CardDescription>Essential details about your agent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="idName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <p className="text-sm text-muted-foreground mb-2">
                  Unique identifier for your agent.
                </p>
                <FormControl>
                  <Input placeholder="my_awesome_agent" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metadata.displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <p className="text-sm text-muted-foreground mb-2">
                  The display name of your Agent.
                </p>
                <FormControl>
                  <Input placeholder="My Awesome Agent" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metadata.description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <div className='flex flex-row items-center justify-between'>
                  <p className="text-sm text-muted-foreground mb-2">
                    A short description of your agent.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {field.value?.length || 0} / 150
                  </p>
                </div>
                <FormControl>
                  <Input placeholder="An awesome agent that helps users do anything" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metadata.tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <p className="text-sm text-muted-foreground mb-2">
                  Select one or more tags that describe your agent.
                </p>
                <FormControl>
                  <CapTags
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Search tags..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metadata.homepage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Homepage (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com"
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === '' ? undefined : value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Link to your agent's homepage or documentation
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metadata.repository"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repository (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://github.com/user/repo"
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === '' ? undefined : value);
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

      {/* Thumbnail */}
      <FormField
        control={form.control}
        name="metadata.thumbnail"
        render={({ field }) => (
          <FormItem>
            <ThumbnailUpload
              thumbnail={field.value}
              onThumbnailChange={(value) => {
                field.onChange(value === '' ? undefined : value);
              }}
            />
          </FormItem>
        )}
      />
    </DashboardGrid>
  );
}
