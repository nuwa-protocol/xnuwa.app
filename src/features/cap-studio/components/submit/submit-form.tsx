import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  FileText,
  Globe,
  Image as ImageIcon,
  Loader2,
  Lock,
  Tag,
  Upload,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { type CapSubmitRequest, mockSubmitCap } from '@/mocks/submit-caps';
import { toast } from '@/shared/components';
import {
  Badge,
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
  DialogTrigger,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from '@/shared/components/ui';
import { generateUUID } from '@/shared/utils';
import { useLocalCapsHandler } from '../../hooks/use-local-caps-handler';
import type { LocalCap } from '../../types';
import { DashboardGrid } from '../layout/dashboard-layout';
import { PublishDialog } from './publish-dialog';

const submitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description too long'),
  tag: z.string().min(1, 'Category is required'),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, 'Version must be in format x.y.z'),
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
  termsAccepted: z
    .boolean()
    .refine((val) => val === true, 'You must accept the terms'),
});

type SubmitFormData = z.infer<typeof submitSchema>;

interface SubmitFormProps {
  cap: LocalCap;
  onSubmit?: (success: boolean, capId?: string) => void;
  onCancel?: () => void;
}

const predefinedTags = [
  'productivity',
  'development',
  'content',
  'analysis',
  'automation',
  'communication',
  'research',
  'creative',
  'utility',
  'education',
  'business',
  'personal',
];

const licenses = [
  'MIT',
  'Apache-2.0',
  'GPL-3.0',
  'BSD-3-Clause',
  'ISC',
  'CC-BY-4.0',
  'Proprietary',
];

export function SubmitForm({ cap, onSubmit, onCancel }: SubmitFormProps) {
  const { updateCap } = useLocalCapsHandler();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);

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
      termsAccepted: false,
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

  const handleScreenshotUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit per file
        toast({
          type: 'error',
          description: `${file.name} is over 5MB limit`,
        });
        return false;
      }
      return true;
    });

    if (screenshotFiles.length + validFiles.length > 5) {
      toast({
        type: 'error',
        description: 'Maximum 5 screenshots allowed',
      });
      return;
    }

    setScreenshotFiles((prev) => [...prev, ...validFiles]);
  };

  const removeScreenshot = (index: number) => {
    setScreenshotFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (data: SubmitFormData) => {
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Prepare submission request
      const submitRequest: CapSubmitRequest = {
        cap,
        metadata: {
          name: data.name,
          version: data.version,
          description: data.description,
          tag: data.tag,
          author: data.author,
          license: data.license,
          homepage: data.homepage || undefined,
          repository: data.repository || undefined,
          changelog: undefined,
          minNuwaVersion: undefined,
          compatibility: undefined,
          isPublic: data.isPublic,
          allowForking: true,
          communitySupport: true,
        },
      };

      // Submit using mock function
      const result = await mockSubmitCap(submitRequest);

      setUploadProgress(100);

      if (result.success) {
        // Update cap status to submitted
        updateCap(cap.id, { status: 'submitted' });

        toast({
          type: 'success',
          description: result.message,
        });

        onSubmit?.(true, result.capId);
        setShowPublishDialog(true);
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
      setUploadProgress(0);
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

        <div className="flex items-center space-x-2">
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Store Listing Preview</DialogTitle>
                <DialogDescription>
                  Preview how your cap will appear in the store
                </DialogDescription>
              </DialogHeader>
              <CapStorePreview
                data={watchedData}
                cap={cap}
                thumbnail={thumbnailFile}
              />
            </DialogContent>
          </Dialog>

          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <DashboardGrid cols={2}>
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
                        <Input placeholder="My Awesome Cap" {...field} />
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
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

                  <FormField
                    control={form.control}
                    name="version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Version</FormLabel>
                        <FormControl>
                          <Input placeholder="1.0.0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Keywords (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ai, assistant, productivity"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated keywords to help users find your cap
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Author & Legal */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Author & Legal</CardTitle>
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
                        <Input placeholder="Your Name" {...field} />
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
                  name="license"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {licenses.map((license) => (
                            <SelectItem key={license} value={license}>
                              {license}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                        <Input placeholder="https://example.com" {...field} />
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
                        />
                      </FormControl>
                      <FormDescription>
                        Link to the source code repository
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Public Listing
                        </FormLabel>
                        <FormDescription>
                          Make this cap publicly discoverable in the store
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </DashboardGrid>

          {/* Documentation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Documentation</CardTitle>
              <CardDescription>
                Provide comprehensive documentation for your cap
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="readme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>README (Markdown)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="# My Cap\n\nDetailed documentation..."
                        rows={12}
                        className="font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Markdown documentation that will be shown on the cap's
                      detail page
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Media Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Media Assets</CardTitle>
              <CardDescription>
                Upload thumbnail and screenshots to showcase your cap
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Thumbnail */}
              <div>
                <FormLabel className="text-sm font-medium mb-2 block">
                  Thumbnail (Optional)
                </FormLabel>
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
                      id={generateUUID()}
                    />
                    <label htmlFor="thumbnail-upload">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Thumbnail
                        </span>
                      </Button>
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to 2MB. Recommended: 400x400px
                    </p>
                  </div>
                </div>
              </div>

              {/* Screenshots */}
              <div>
                <FormLabel className="text-sm font-medium mb-2 block">
                  Screenshots (Optional)
                </FormLabel>
                <div className="space-y-4">
                  {screenshotFiles.length > 0 && (
                    <div className="grid grid-cols-5 gap-4">
                      {screenshotFiles.map((file, index) => (
                        <div
                          key={generateUUID()}
                          className="relative aspect-video rounded-lg border overflow-hidden"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Screenshot ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => removeScreenshot(index)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleScreenshotUpload}
                      className="hidden"
                      id={generateUUID()}
                    />
                    <label htmlFor="screenshots-upload">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Add Screenshots
                        </span>
                      </Button>
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to 5MB each. Maximum 5 screenshots.
                      Recommended: 1280x720px
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms & Submit */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>I accept the terms and conditions</FormLabel>
                        <FormDescription>
                          By submitting this cap, you agree to the Nuwa Store
                          Terms of Service and Content Policy.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {isSubmitting && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Uploading cap...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    {form.formState.isValid && form.watch('termsAccepted') ? (
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

                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !form.formState.isValid ||
                      !form.watch('termsAccepted')
                    }
                    size="lg"
                  >
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
            </CardContent>
          </Card>
        </form>
      </Form>

      <PublishDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        capName={watchedData.name}
      />
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
          <div className="flex items-center space-x-2 mt-2">
            <Badge>
              <Tag className="h-3 w-3 mr-1" />
              {data.tag}
            </Badge>
            <Badge variant="outline">v{data.version}</Badge>
            <Badge variant="outline">
              {data.isPublic ? (
                <Globe className="h-3 w-3 mr-1" />
              ) : (
                <Lock className="h-3 w-3 mr-1" />
              )}
              {data.isPublic ? 'Public' : 'Private'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <h4 className="font-semibold mb-2">Description</h4>
        <p className="text-muted-foreground">
          {data.description || 'No description provided'}
        </p>
      </div>

      {/* Technical Details */}
      <div>
        <h4 className="font-semibold mb-2">Technical Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Model:</span>
            <span className="ml-2">{cap.model.name}</span>
          </div>
          <div>
            <span className="text-muted-foreground">MCP Servers:</span>
            <span className="ml-2">{Object.keys(cap.mcpServers).length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">License:</span>
            <span className="ml-2">{data.license}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Downloads:</span>
            <span className="ml-2">0</span>
          </div>
        </div>
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
