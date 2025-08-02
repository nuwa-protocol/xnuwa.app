import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Loader2,
  Upload,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from '@/shared/components';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/shared/components/ui';
import type { LocalCap } from '../../types';
import { DashboardGrid } from '../layout/dashboard-layout';

const submitSchema = z.object({
  author: z.string().min(1, 'Author name is required'),
  homepage: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  repository: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
});

export type SubmitFormData = z.infer<typeof submitSchema>;

interface SubmitFormProps {
  cap: LocalCap;
  onSubmit?: (success: boolean, capId?: string) => void;
  onCancel?: () => void;
  onConfirmedSubmit: (
    data: SubmitFormData,
    thumbnailFile: File | null,
  ) => Promise<void>;
}

export function SubmitForm({
  cap,
  onSubmit,
  onCancel,
  onConfirmedSubmit,
}: SubmitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const form = useForm<SubmitFormData>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      author: '',
      homepage: '',
      repository: '',
    },
  });

  const watchedData = form.watch();

  const handleThumbnailUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // 2MB limit
        toast({
          type: 'error',
          description: 'Thumbnail must be under 2MB',
        });
        return;
      }
      setThumbnailFile(file);
    }
  };

  const handleFormSubmit = async () => {
    // Trigger validation and show errors
    const isValid = await form.trigger();

    if (!isValid) {
      // Form will show validation errors automatically
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleConfirmedSubmit = async () => {
    const data = form.getValues();
    setIsSubmitting(true);
    setShowConfirmDialog(false);

    try {
      await onConfirmedSubmit(data, thumbnailFile);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to submit cap. Please try again.';
      toast({
        type: 'error',
        description: errorMessage,
      });

      onSubmit?.(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Submit Cap to Store</h3>
          <p className="text-sm text-muted-foreground">
            Publish "{cap.name}" to the Nuwa Cap Store for others to discover
            and use
          </p>
        </div>

        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>

      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFormSubmit();
          }}
          className="space-y-6"
        >
          <DashboardGrid cols={1}>
            {/* Cap Information - Read Only */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cap Information</CardTitle>
                <CardDescription>
                  Basic information about your cap (read-only)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Name
                    </div>
                    <p className="text-sm">{cap.name}</p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Display Name
                    </div>
                    <p className="text-sm">{cap.displayName}</p>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Description
                  </div>
                  <p className="text-sm">{cap.description}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Tags
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {cap.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Model
                    </div>
                    <p className="text-sm">{cap.model.name}</p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      MCP Servers
                    </div>
                    <p className="text-sm">
                      {Object.keys(cap.mcpServers).length > 0
                        ? Object.keys(cap.mcpServers).join(', ')
                        : 'None'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Author */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Author</CardTitle>
                <CardDescription>
                  Information about the cap author and licensing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your Name"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger('author');
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Your name or organization name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
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
                            form.trigger('homepage');
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
                            form.trigger('repository');
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
          </DashboardGrid>

          {/* Thumbnail Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thumbnail</CardTitle>
              <CardDescription>
                Upload thumbnail to represent your cap
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center space-x-4">
                  {thumbnailFile ? (
                    <div className="relative w-24 h-24 rounded-lg border overflow-hidden">
                      <img
                        src={URL.createObjectURL(thumbnailFile)}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => setThumbnailFile(null)}
                      >
                        ×
                      </Button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <Input
                      id={`thumbnail-upload-${Math.random()}`}
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                    />
                    <label htmlFor="thumbnail-upload">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </span>
                      </Button>
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to 2MB. 400x400px. <br />
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Card className="border-none shadow-none">
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    {form.formState.isValid ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Ready to submit</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        <span>Please complete all required fields</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {onCancel && (
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={onCancel}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button type="submit" disabled={isSubmitting} size="lg">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Submit to Store
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Submission</DialogTitle>
            <DialogDescription>
              Please review your cap information before submitting to the store
            </DialogDescription>
          </DialogHeader>
          <CapStorePreview
            data={watchedData}
            cap={cap}
            thumbnail={thumbnailFile}
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSubmitting}
            >
              Go Back
            </Button>
            <Button onClick={handleConfirmedSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Confirm Submit
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface CapStorePreviewProps {
  data: SubmitFormData;
  cap: LocalCap;
  thumbnail?: File | null;
}

function CapStorePreview({ data, cap, thumbnail }: CapStorePreviewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start space-x-4">
        {thumbnail ? (
          <img
            src={URL.createObjectURL(thumbnail)}
            alt="Thumbnail"
            className="w-16 h-16 rounded-lg object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <FileText className="h-8 w-8 text-primary" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-xl font-bold">
            {cap.displayName || 'Untitled Cap'}
          </h3>
          <p className="text-muted-foreground">
            by {data.author || 'Unknown Author'}
          </p>
        </div>
      </div>

      {/* Description */}
      <div>
        <h4 className="font-semibold mb-2">Description</h4>
        <p className="text-muted-foreground">
          {cap.description || 'No description provided'}
        </p>
      </div>
      {/* Links */}
      {(data.homepage || data.repository) && (
        <div>
          <h4 className="font-semibold mb-2">Links</h4>
          <div className="space-y-1 text-sm">
            {data.homepage && (
              <div>
                <span className="text-muted-foreground">Homepage:</span>
                <a
                  href={data.homepage}
                  className="ml-2 text-primary hover:underline"
                >
                  {data.homepage}
                </a>
              </div>
            )}
            {data.repository && (
              <div>
                <span className="text-muted-foreground">Repository:</span>
                <a
                  href={data.repository}
                  className="ml-2 text-primary hover:underline"
                >
                  {data.repository}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
