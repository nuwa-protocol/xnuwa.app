import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  Save,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useSelectedModel } from '@/features/cap-studio/hooks';
import type { LocalCap } from '@/features/cap-studio/types';
import { toast } from '@/shared/components';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
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
import { DashboardGrid } from '../layout/dashboard-layout';
import { ModelSelectorDialog } from '../model-selector';
import { predefinedTags } from './constants';
import { ModelDetails } from './model-details';
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

export function CapBuilder({ editingCap, onSave, onCancel }: CapBuilderProps) {
  const { createCap, updateCap } = useLocalCapsHandler();
  const { selectedModel } = useSelectedModel();
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
          prompt: data.prompt,
          model: selectedModel,
          mcpServers,
        });

        const updatedCap = {
          ...editingCap,
          ...data,
          model: selectedModel,
          mcpServers,
          updatedAt: Date.now(),
        };

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
          prompt: data.prompt,
          model: selectedModel,
          status: 'draft',
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {editingCap ? 'Edit Cap' : 'Create New Cap'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {editingCap ? 'Update your Cap' : 'Build a new Cap from scratch'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSaving || !form.formState.isValid}>
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
          <DashboardGrid cols={1}>
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
              </CardContent>
            </Card>

            {/* Model Configuration (use Model Selector) */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">
                      Model Configuration
                    </CardTitle>
                    <CardDescription>
                      Choose the AI model for your cap
                    </CardDescription>
                  </div>
                  <ModelSelectorDialog />
                </div>
              </CardHeader>
              <CardContent>
                {!selectedModel ? (
                  <div className="text-muted-foreground text-sm">
                    No model selected
                  </div>
                ) : (
                  <ModelDetails model={selectedModel} />
                )}
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
                    This prompt will guide the AI model's behavior when using
                    your cap
                  </CardDescription>
                </div>
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
                    Only SSE and HTTP Streambale transports are supported.
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
              <div className="flex items-center space-x-2">
                {onCancel && (
                  <Button variant="ghost" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
              </div>
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
