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
import { type CapSubmitRequest, mockSubmitCap } from '@/mocks/submit-caps';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/shared/components/ui';
import { useLocalCapsHandler } from '../../hooks/use-local-caps-handler';
import type { LocalCap } from '../../types';
import { predefinedTags } from '../cap-edit/constants';
import { DashboardGrid } from '../layout/dashboard-layout';

const submitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description too long'),
  tag: z.string().min(1, 'Category is required'),
  author: z.string().min(1, 'Author name is required'),
  keywords: z.string().optional(),
  readme: z.string().min(50, 'README must be at least 50 characters'),
  license: z.string().min(1, 'License is required'),
  homepage: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  repository: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  isPublic: z.boolean(),
});

type SubmitFormData = z.infer<typeof submitSchema>;

interface SubmitFormProps {
  cap: LocalCap;
  onSubmit?: (success: boolean, capId?: string) => void;
  onCancel?: () => void;
}

export function SubmitForm({ cap, onSubmit, onCancel }: SubmitFormProps) {
  const { updateCap } = useLocalCapsHandler();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const form = useForm<SubmitFormData>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      name: cap.name,
      description: cap.description,
      tag: cap.tag,
      author: '',
      keywords: '',
      readme: `# ${cap.name}\n\n${cap.description}\n\n## Usage\n\nThis cap provides...\n\n## Features\n\n- Feature 1\n- Feature 2\n- Feature 3\n\n## Requirements\n\n- Model: ${cap.model.name}\n- MCP Servers: ${Object.keys(cap.mcpServers).length > 0 ? Object.keys(cap.mcpServers).join(', ') : 'None'}\n\n## Installation\n\n1. Install from the Nuwa Cap Store\n2. Configure any required MCP servers\n3. Start using the cap!\n`,
      license: 'MIT',
      homepage: '',
      repository: '',
      isPublic: true,
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
      // Prepare submission request
      const submitRequest: CapSubmitRequest = {
        cap,
        metadata: {
          name: data.name,
          description: data.description,
          tag: data.tag,
          author: data.author,
          homepage: data.homepage || undefined,
          repository: data.repository || undefined,
          changelog: undefined,
        },
      };

      // Submit using mock function
      const result = await mockSubmitCap(submitRequest);

      if (result.success) {
        // Update cap status to submitted
        updateCap(cap.id, { status: 'submitted' });

        toast({
          type: 'success',
          description: result.message,
        });

        onSubmit?.(true, result.capId);
      } else {
        throw new Error(result.message);
      }
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
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Store Listing</CardTitle>
                <CardDescription>
                  Information that will be displayed in the cap store
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="My Awesome Cap"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger('name');
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        The name shown in the cap store
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A comprehensive description of what your cap does and how it helps users..."
                          rows={4}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger('description');
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Detailed description shown in the store (20-1000
                        characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.trigger('tag');
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {predefinedTags.map((tag) => (
                            <SelectItem key={tag} value={tag}>
                              {tag}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Additional Information
              </CardTitle>
              <CardDescription>
                Optional details to enhance your cap listing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keywords (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="AI, automation, productivity"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          form.trigger('keywords');
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Comma-separated keywords to help users find your cap
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="readme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>README</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed documentation about your cap..."
                        rows={6}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          form.trigger('readme');
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Comprehensive documentation (minimum 50 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="license"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.trigger('license');
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select license" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MIT">MIT</SelectItem>
                        <SelectItem value="Apache-2.0">Apache 2.0</SelectItem>
                        <SelectItem value="GPL-3.0">GPL 3.0</SelectItem>
                        <SelectItem value="BSD-3-Clause">
                          BSD 3-Clause
                        </SelectItem>
                        <SelectItem value="ISC">ISC</SelectItem>
                        <SelectItem value="Proprietary">Proprietary</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.checked);
                          form.trigger('isPublic');
                        }}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Make this cap publicly visible</FormLabel>
                      <FormDescription>
                        Allow other users to discover and install your cap
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
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
          <h3 className="text-xl font-bold">{data.name || 'Untitled Cap'}</h3>
          <p className="text-muted-foreground">
            by {data.author || 'Unknown Author'}
          </p>
        </div>
      </div>

      {/* Description */}
      <div>
        <h4 className="font-semibold mb-2">Description</h4>
        <p className="text-muted-foreground">
          {data.description || 'No description provided'}
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
