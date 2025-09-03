import type { UseFormReturn } from 'react-hook-form';
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
  Textarea,
} from '@/shared/components/ui';
import { DashboardGrid } from '../../layout/dashboard-layout';
import { CapTags } from './cap-tags';
import { ThumbnailUpload } from './thumbnail-upload';

interface GeneralTabProps {
  form: UseFormReturn<any>;
}

export function GeneralTab({
  form,
}: GeneralTabProps) {
  return (
    <DashboardGrid cols={1}>
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
          <CardDescription>Essential details about your cap</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="idName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <p className="text-sm text-muted-foreground mb-2">
                  Unique identifier for your cap.
                </p>
                <FormControl>
                  <Input placeholder="my_awesome_cap" {...field} />
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
                  Human-readable name shown in the store.
                </p>
                <FormControl>
                  <Input placeholder="My Awesome Cap" {...field} />
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
                <FormControl>
                  <Textarea
                    placeholder="Describe what your cap does..."
                    rows={3}
                    {...field}
                  />
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
                  Select one or more tags that describe your cap.
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
        </CardContent>
      </Card>

      {/* Author Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Author Information</CardTitle>
          <CardDescription>
            Information about the cap author and licensing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="metadata.homepage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Homepage (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com"
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === '' ? undefined : value);
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
