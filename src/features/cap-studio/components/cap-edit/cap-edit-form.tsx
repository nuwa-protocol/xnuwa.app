import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, Loader2, Save } from 'lucide-react';
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
  MultiSelect,
  Textarea,
} from '@/shared/components/ui';
import { useLocalCapsHandler } from '../../hooks/use-local-caps-handler';
import type { McpServerConfig } from '../../types';
import { DashboardGrid } from '../layout/dashboard-layout';
import { ModelSelectorDialog } from '../model-selector';
import { predefinedTags } from './constants';
import { McpServersConfig } from './mcp-servers-config';
import { ModelDetails } from './model-details';
import { PromptEditor } from './prompt-editor';

const capSchema = z.object({
  name: z
    .string()
    .min(6, 'Name must be at least 6 characters')
    .max(20, 'Name must be at most 20 characters')
    .regex(
      /^[a-z_-]+$/,
      'Name must contain only lowercase letters, underscores, and dashes, no spaces',
    ),
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(50, 'Display name too long'),
  description: z
    .string()
    .min(20, 'Description must be at least 10 characters')
    .max(500, 'Description too long'),
  tags: z.array(z.string()),
  prompt: z.string(),
});

type CapFormData = z.infer<typeof capSchema>;

interface CapEditFormProps {
  editingCap?: LocalCap;
  onSave?: (cap: LocalCap) => void;
  onCancel?: () => void;
}

export function CapEditForm({
  editingCap,
  onSave,
  onCancel,
}: CapEditFormProps) {
  const { createCap, updateCap } = useLocalCapsHandler();
  const { selectedModel } = useSelectedModel();
  const [isSaving, setIsSaving] = useState(false);
  const [mcpServers, setMcpServers] = useState<Record<string, McpServerConfig>>(
    {},
  );

  const form = useForm<CapFormData>({
    resolver: zodResolver(capSchema),
    mode: 'onChange',
    defaultValues: {
      name: editingCap?.name || '',
      displayName: editingCap?.displayName || '',
      description: editingCap?.description || '',
      tags: editingCap?.tags || [],
      prompt: editingCap?.prompt || '',
    },
  });

  useEffect(() => {
    if (editingCap) {
      setMcpServers(editingCap.mcpServers || {});
    }
  }, [editingCap]);

  const handleSave = async (data: CapFormData) => {
    // Trigger validation for all fields
    const isValid = await form.trigger();

    if (!isValid) {
      toast({
        type: 'error',
        description: 'Please fix all validation errors before saving',
      });
      return;
    }

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
          displayName: data.displayName,
          description: data.description,
          tags: data.tags,
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
          description: `${data.displayName} has been updated successfully`,
        });

        onSave?.(updatedCap);
      } else {
        // Create new cap
        const newCap = createCap({
          name: data.name,
          displayName: data.displayName,
          description: data.description,
          tags: data.tags,
          prompt: data.prompt,
          model: selectedModel,
          status: 'draft',
          mcpServers,
        });

        toast({
          type: 'success',
          description: `${data.displayName} has been created successfully`,
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

  const handleUpdateMcpServers = (servers: Record<string, McpServerConfig>) => {
    setMcpServers(servers);
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
          <Button
            type="button"
            disabled={isSaving}
            onClick={form.handleSubmit(handleSave)}
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
                      <p className="text-sm text-muted-foreground mb-2">
                        Unique identifier for your cap.
                      </p>
                      <FormControl>
                        <Input placeholder="my-awesome_cap" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="displayName"
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
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <p className="text-sm text-muted-foreground mb-2">
                        Select one or more tags that describe your cap.
                      </p>
                      <FormControl>
                        <MultiSelect
                          options={predefinedTags.map((tag) => ({
                            label: tag,
                            value: tag,
                          }))}
                          onValueChange={field.onChange}
                          defaultValue={field.value || []}
                          placeholder="Select tags..."
                          className="w-full"
                        />
                      </FormControl>
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
          <McpServersConfig
            mcpServers={mcpServers}
            onUpdateMcpServers={handleUpdateMcpServers}
            capId={editingCap?.id}
          />

          {/* Submit */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center space-x-2 text-sm">
              {Object.keys(form.formState.errors).length === 0 ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Cap configuration is valid</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>
                    {Object.keys(form.formState.errors).length} error
                    {Object.keys(form.formState.errors).length > 1 ? 's' : ''}{' '}
                    found
                  </span>
                </div>
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
              <Button type="submit" disabled={isSaving}>
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
