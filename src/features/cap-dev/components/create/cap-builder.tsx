import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, Eye, Loader2, Plus, Save, Wand2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ModelStateStore } from '@/features/cap-dev/stores';
import { useCapDevStore, type LocalCap } from '@/features/cap-dev/stores';
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
  DialogTrigger,
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
import { DashboardGrid } from '../layout/dashboard-layout';
import { ModelConfig } from './model-config';
import { PromptEditor } from './prompt-editor';

const capSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description too long'),
  tag: z.string().min(1, 'Tag is required'),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, 'Version must be in format x.y.z'),
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
});

type CapFormData = z.infer<typeof capSchema>;

interface CapBuilderProps {
  editingCap?: LocalCap;
  onSave?: (cap: LocalCap) => void;
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

const promptTemplates = [
  {
    name: 'Code Assistant',
    description: 'Help with programming tasks',
    prompt:
      'You are a helpful programming assistant. Help the user with coding tasks, explain concepts, and provide best practices. Always write clean, well-documented code.',
  },
  {
    name: 'Content Writer',
    description: 'Create written content',
    prompt:
      'You are a professional content writer. Create engaging, well-structured content that is informative and tailored to the target audience. Maintain a consistent tone and style.',
  },
  {
    name: 'Data Analyst',
    description: 'Analyze data and provide insights',
    prompt:
      'You are a data analyst. Help analyze data, identify patterns, create visualizations, and provide actionable insights. Always explain your methodology and findings clearly.',
  },
  {
    name: 'Research Assistant',
    description: 'Research and summarize information',
    prompt:
      'You are a research assistant. Help gather, analyze, and summarize information from various sources. Provide well-structured research with proper citations and key insights.',
  },
];

export function CapBuilder({ editingCap, onSave, onCancel }: CapBuilderProps) {
  const { createCap, updateCap } = useCapDevStore();
  const { selectedModel } = ModelStateStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [mcpServers, setMcpServers] = useState<Record<string, { url: string }>>(
    {},
  );

  const form = useForm<CapFormData>({
    resolver: zodResolver(capSchema),
    defaultValues: {
      name: editingCap?.name || '',
      description: editingCap?.description || '',
      tag: editingCap?.tag || '',
      version: editingCap?.version || '1.0.0',
      prompt: editingCap?.prompt || '',
    },
  });

  useEffect(() => {
    if (editingCap) {
      setMcpServers(editingCap.mcpServers || {});
    }
  }, [editingCap]);

  const handleSave = async (data: CapFormData) => {
    if (!selectedModel) {
      toast({
        type: 'error',
        description: 'Please select a model for this cap',
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editingCap) {
        // Update existing cap
        updateCap(editingCap.id, {
          name: data.name,
          description: data.description,
          tag: data.tag,
          version: data.version,
          prompt: data.prompt,
          model: selectedModel,
          mcpServers,
        });
        
        const updatedCap = { ...editingCap, ...data, model: selectedModel, mcpServers, updatedAt: Date.now() };
        
        toast({
          type: 'success',
          description: `${data.name} has been updated successfully`,
        });
        
        onSave?.(updatedCap);
      } else {
        // Create new cap
        const newCap = createCap({
          name: data.name,
          description: data.description,
          tag: data.tag,
          version: data.version,
          prompt: data.prompt,
          model: selectedModel,
          mcpServers,
        });
        
        toast({
          type: 'success',
          description: `${data.name} has been created successfully`,
        });
        
        onSave?.(newCap);
      }
    } catch (error) {
      toast({
        type: 'error',
        description: 'Failed to save cap. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMcpServer = () => {
    const name = `server_${Object.keys(mcpServers).length + 1}`;
    setMcpServers((prev) => ({
      ...prev,
      [name]: { url: '' },
    }));
  };

  const handleRemoveMcpServer = (name: string) => {
    setMcpServers((prev) => {
      const { [name]: removed, ...rest } = prev;
      return rest;
    });
  };

  const handleUpdateMcpServer = (name: string, url: string) => {
    setMcpServers((prev) => ({
      ...prev,
      [name]: { url },
    }));
  };

  const handleUseTemplate = (template: (typeof promptTemplates)[0]) => {
    form.setValue('prompt', template.prompt);
    if (!form.getValues('name')) {
      form.setValue('name', template.name);
    }
    if (!form.getValues('description')) {
      form.setValue('description', template.description);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {editingCap ? 'Edit Cap' : 'Create New Cap'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {editingCap
              ? 'Modify your capability'
              : 'Build a new capability from scratch'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Cap Preview</DialogTitle>
                <DialogDescription>
                  Preview how your cap will look and function
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Name:</strong>{' '}
                    {form.watch('name') || 'Untitled Cap'}
                  </div>
                  <div>
                    <strong>Version:</strong> {form.watch('version') || '1.0.0'}
                  </div>
                  <div>
                    <strong>Tag:</strong> {form.watch('tag') || 'None'}
                  </div>
                  <div>
                    <strong>Model:</strong>{' '}
                    {selectedModel?.name || 'None selected'}
                  </div>
                </div>
                <div>
                  <strong>Description:</strong>
                  <p className="text-muted-foreground mt-1">
                    {form.watch('description') || 'No description provided'}
                  </p>
                </div>
                <div>
                  <strong>Prompt:</strong>
                  <div className="mt-1 p-3 bg-muted rounded-md text-sm font-mono">
                    {form.watch('prompt') || 'No prompt provided'}
                  </div>
                </div>
                <div>
                  <strong>
                    MCP Servers ({Object.keys(mcpServers).length}):
                  </strong>
                  {Object.keys(mcpServers).length > 0 ? (
                    <ul className="mt-1 space-y-1 text-sm">
                      {Object.entries(mcpServers).map(([name, config]) => (
                        <li key={name} className="flex justify-between">
                          <span>{name}</span>
                          <span className="text-muted-foreground">
                            {config.url || 'No URL'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No MCP servers configured
                    </p>
                  )}
                </div>
              </div>
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
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
          <DashboardGrid cols={2}>
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basic Information</CardTitle>
                <CardDescription>
                  Essential details about your cap
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Awesome Cap" {...field} />
                      </FormControl>
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
                          placeholder="Describe what your cap does..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
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
              </CardContent>
            </Card>

            {/* Model Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Model Configuration</CardTitle>
                <CardDescription>
                  Choose the AI model for your cap
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ModelConfig />
              </CardContent>
            </Card>
          </DashboardGrid>

          {/* Prompt Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    Prompt Configuration
                  </CardTitle>
                  <CardDescription>
                    Define the behavior and instructions for your cap
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Wand2 className="h-4 w-4 mr-2" />
                      Templates
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Prompt Templates</DialogTitle>
                      <DialogDescription>
                        Choose a template to get started quickly
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3">
                      {promptTemplates.map((template) => (
                        <Card
                          key={template.name}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleUseTemplate(template)}
                        >
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">
                              {template.name}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {template.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {template.prompt}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <PromptEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Enter your prompt instructions here..."
                      />
                    </FormControl>
                    <FormDescription>
                      This prompt will guide the AI model's behavior when using
                      your cap
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* MCP Servers */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">MCP Servers</CardTitle>
                  <CardDescription>
                    Configure Model Context Protocol servers for additional
                    capabilities
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddMcpServer}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Server
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {Object.keys(mcpServers).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No MCP servers configured</p>
                  <p className="text-sm">
                    Add servers to extend your cap's capabilities
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(mcpServers).map(([name, config]) => (
                    <div
                      key={name}
                      className="flex items-center space-x-4 p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <Input
                          placeholder="Server name"
                          value={name}
                          onChange={(e) => {
                            const newName = e.target.value;
                            const { [name]: server, ...rest } = mcpServers;
                            setMcpServers({ ...rest, [newName]: server });
                          }}
                          className="mb-2"
                        />
                        <Input
                          placeholder="Server URL"
                          value={config.url}
                          onChange={(e) =>
                            handleUpdateMcpServer(name, e.target.value)
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMcpServer(name)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              {form.formState.isValid ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Cap configuration is valid</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span>Please complete all required fields</span>
                </>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                type="submit"
                disabled={isSaving || !form.formState.isValid}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingCap ? 'Update Cap' : 'Create Cap'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
