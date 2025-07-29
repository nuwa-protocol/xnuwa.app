import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import {
  ChevronDown,
  ChevronRight,
  Code,
  Code2,
  Copy,
  Database,
  FileText,
  Play,
  Search,
  Wrench,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/shared/components';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui';
import type { NuwaMCPClient } from '@/shared/types';
import { cn } from '@/shared/utils';

interface LogEntry {
  type: 'info' | 'error' | 'success' | 'warning';
  message: string;
  data?: any;
}

interface McpDebugPanelProps {
  client: NuwaMCPClient;
  tools: string[];
  toolsMap: Record<string, any>;
  prompts: string[];
  promptsMap: Record<string, any>;
  resources: string[];
  onLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
}

const generateUUID = (): string => {
  if (
    typeof globalThis !== 'undefined' &&
    (globalThis as any).crypto?.randomUUID
  ) {
    return (globalThis as any).crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
};

interface ToolsSelectDialogProps {
  tools: string[];
  toolsMap: Record<string, any>;
  executionResults: Record<string, any>;
  selectedTool: string | null;
  searchQuery: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSearchChange: (query: string) => void;
  onToolSelect: (tool: string) => void;
}

function ToolsSelectDialog({
  tools,
  toolsMap,
  executionResults,
  selectedTool,
  searchQuery,
  isOpen,
  onOpenChange,
  onSearchChange,
  onToolSelect,
}: ToolsSelectDialogProps) {
  const filteredTools = tools.filter((tool) =>
    tool.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Code className="h-4 w-4" />
          <span>Browse Tools ({tools.length})</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Available Tools</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {filteredTools.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tools found</p>
                </div>
              ) : (
                filteredTools.map((tool) => {
                  const toolInfo = toolsMap[tool];
                  const hasResult = executionResults[tool];
                  const paramCount = toolInfo?.parameters?.jsonSchema
                    ?.properties
                    ? Object.keys(toolInfo.parameters.jsonSchema.properties)
                        .length
                    : toolInfo?.parameters?.properties
                      ? Object.keys(toolInfo.parameters.properties).length
                      : 0;

                  return (
                    <button
                      type="button"
                      key={tool}
                      className={cn(
                        'w-full text-left p-4 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50',
                        selectedTool === tool &&
                          'bg-primary/10 border-primary/50',
                      )}
                      onClick={() => {
                        onToolSelect(tool);
                        onOpenChange(false);
                      }}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{tool}</span>
                          {hasResult && (
                            <Badge
                              variant="secondary"
                              className="text-xs px-1.5 py-0.5"
                            >
                              ✓
                            </Badge>
                          )}
                        </div>
                        {toolInfo?.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {toolInfo.description}
                          </p>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {paramCount}{' '}
                          {paramCount === 1 ? 'parameter' : 'parameters'}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function McpDebugPanel({
  client,
  tools,
  toolsMap,
  prompts,
  promptsMap,
  resources,
  onLog,
}: McpDebugPanelProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [toolFormData, setToolFormData] = useState<any>({});
  const [toolSearchQuery, setToolSearchQuery] = useState('');
  const [promptSearchQuery, setPromptSearchQuery] = useState('');
  const [resourceSearchQuery, setResourceSearchQuery] = useState('');
  const [executionResults, setExecutionResults] = useState<Record<string, any>>(
    {},
  );
  const [expandedPrompts, setExpandedPrompts] = useState<Set<string>>(
    new Set(),
  );
  const [toolsDialogOpen, setToolsDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState<
    'tools' | 'prompts' | 'resources'
  >('tools');

  const safeStringify = (obj: any): string => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch (_) {
      return String(obj);
    }
  };

  const handleExecuteTool = async (payload: any) => {
    let args: any;
    if (payload?.preventDefault) {
      payload.preventDefault();
      args = (payload as any).formData ?? {};
    } else if (payload?.formData !== undefined) {
      args = payload.formData;
    } else {
      args = payload ?? {};
    }

    if (!selectedTool || !client) return;

    const tool = toolsMap[selectedTool];
    if (!tool) return;

    try {
      onLog({
        type: 'info',
        message: `Executing tool: ${selectedTool}`,
        data: { tool: selectedTool, args },
      });

      const result = await tool.execute(args, {
        toolCallId: generateUUID(),
        messages: [],
      });

      setExecutionResults((prev) => ({
        ...prev,
        [selectedTool]: {
          type: 'tool',
          args,
          result,
          timestamp: Date.now(),
        },
      }));

      onLog({
        type: 'success',
        message: `Tool executed successfully: ${selectedTool}`,
        data: { result },
      });

      toast({
        type: 'success',
        description: `${selectedTool} completed successfully`,
      });
    } catch (err) {
      onLog({
        type: 'error',
        message: `Tool execution failed: ${String(err)}`,
        data: { tool: selectedTool, error: err },
      });

      toast({
        type: 'error',
        description: String(err),
      });
    }
  };

  const handleExecutePrompt = async (promptName: string) => {
    if (!client) return;

    try {
      onLog({
        type: 'info',
        message: `Executing prompt: ${promptName}`,
        data: { prompt: promptName },
      });

      const prompt = promptsMap[promptName];
      let result: any;

      if (prompt?.execute) {
        result = await prompt.execute({});
      } else {
        result = await client.getPrompt(promptName, {});
      }

      setExecutionResults((prev) => ({
        ...prev,
        [promptName]: {
          type: 'prompt',
          result,
          timestamp: Date.now(),
        },
      }));

      onLog({
        type: 'success',
        message: `Prompt executed successfully: ${promptName}`,
        data: { result },
      });

      toast({
        type: 'success',
        description: `${promptName} completed successfully`,
      });
    } catch (err) {
      onLog({
        type: 'error',
        message: `Prompt execution failed: ${String(err)}`,
        data: { prompt: promptName, error: err },
      });

      toast({
        type: 'error',
        description: String(err),
      });
    }
  };

  const handleReadResource = async (resourceUri: string) => {
    if (!client) return;

    try {
      onLog({
        type: 'info',
        message: `Reading resource: ${resourceUri}`,
        data: { resource: resourceUri },
      });

      const result = await client.readResource(resourceUri);

      setExecutionResults((prev) => ({
        ...prev,
        [resourceUri]: {
          type: 'resource',
          result,
          timestamp: Date.now(),
        },
      }));

      onLog({
        type: 'success',
        message: `Resource read successfully: ${resourceUri}`,
        data: { result },
      });

      toast({
        type: 'success',
        description: `${resourceUri} read successfully`,
      });
    } catch (err) {
      onLog({
        type: 'error',
        message: `Resource read failed: ${String(err)}`,
        data: { resource: resourceUri, error: err },
      });

      toast({
        type: 'error',
        description: String(err),
      });
    }
  };

  const copyResult = async (key: string) => {
    const result = executionResults[key];
    if (!result) return;

    try {
      await navigator.clipboard.writeText(safeStringify(result.result));
      toast({
        type: 'success',
        description: 'Execution result copied to clipboard',
      });
    } catch (error) {
      toast({
        type: 'error',
        description: 'Failed to copy result to clipboard',
      });
    }
  };

  const togglePromptExpanded = (promptName: string) => {
    setExpandedPrompts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(promptName)) {
        newSet.delete(promptName);
      } else {
        newSet.add(promptName);
      }
      return newSet;
    });
  };

  const filteredPrompts = prompts.filter((prompt) =>
    prompt.toLowerCase().includes(promptSearchQuery.toLowerCase()),
  );

  const filteredResources = resources.filter((resource) =>
    resource.toLowerCase().includes(resourceSearchQuery.toLowerCase()),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <Code2 className="h-4 w-4 mr-2" />
              Debug Interface
            </div>
            <Select
              value={activeView}
              onValueChange={(value: 'tools' | 'prompts' | 'resources') =>
                setActiveView(value)
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tools">
                  <div className="flex items-center">
                    <Wrench className="h-4 w-4 mr-2" />
                    Tools ({tools.length})
                  </div>
                </SelectItem>
                <SelectItem value="prompts">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Prompts ({prompts.length})
                  </div>
                </SelectItem>
                <SelectItem value="resources">
                  <div className="flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    Resources ({resources.length})
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
        <CardDescription className="sr-only">
          Interactive debugging tools for MCP server capabilities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full space-y-4">
          {/* Header with View Selector */}

          {/* Tools View */}
          {activeView === 'tools' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ToolsSelectDialog
                    tools={tools}
                    toolsMap={toolsMap}
                    executionResults={executionResults}
                    selectedTool={selectedTool}
                    searchQuery={toolSearchQuery}
                    isOpen={toolsDialogOpen}
                    onOpenChange={setToolsDialogOpen}
                    onSearchChange={setToolSearchQuery}
                    onToolSelect={setSelectedTool}
                  />
                </div>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    {selectedTool ? (
                      <>
                        <Wrench className="h-4 w-4 mr-2 text-primary" />
                        <span className="font-mono ml-1">{selectedTool}</span>
                      </>
                    ) : (
                      'Select a Tool'
                    )}
                  </CardTitle>
                  {selectedTool && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {toolsMap[selectedTool]?.description ||
                        'No description available'}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  {selectedTool ? (
                    <div className="space-y-4">
                      {/* Parameters Section */}
                      <div className="space-y-3">
                        <div className="text-sm font-medium text-foreground border-b pb-2">
                          Parameters
                        </div>
                        {(() => {
                          const tool = toolsMap[selectedTool];
                          const paramWrapper = tool?.parameters;
                          const schema =
                            paramWrapper?.jsonSchema ?? paramWrapper;

                          if (!schema) {
                            return (
                              <div className="bg-muted/30 rounded-lg p-3 text-center">
                                <p className="text-sm text-muted-foreground">
                                  This tool requires no parameters.
                                </p>
                              </div>
                            );
                          }

                          return (
                            <div className="bg-muted/20 border rounded-lg p-4">
                              <div className="rjsf-form-wrapper">
                                <Form
                                  schema={schema}
                                  formData={toolFormData}
                                  validator={validator}
                                  onChange={(e) => setToolFormData(e.formData)}
                                  onSubmit={handleExecuteTool}
                                  uiSchema={{
                                    'ui:submitButtonOptions': {
                                      norender: true,
                                    },
                                  }}
                                />
                              </div>
                              <style>{`
                            .rjsf-form-wrapper .form-control {
                              border: 1px solid hsl(var(--border)) !important;
                              border-radius: 6px !important;
                              padding: 8px 12px !important;
                              background: hsl(var(--background)) !important;
                              font-size: 14px !important;
                              width: 100% !important;
                            }
                            .rjsf-form-wrapper .form-control:focus {
                              border-color: hsl(var(--primary)) !important;
                              box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2) !important;
                              outline: none !important;
                            }
                            .rjsf-form-wrapper .form-group label {
                              font-weight: 500 !important;
                              font-size: 14px !important;
                              color: hsl(var(--foreground)) !important;
                              margin-bottom: 6px !important;
                              display: block !important;
                            }
                            .rjsf-form-wrapper .form-group {
                              margin-bottom: 16px !important;
                            }
                            .rjsf-form-wrapper .field-description {
                              font-size: 12px !important;
                              color: hsl(var(--muted-foreground)) !important;
                              margin-top: 4px !important;
                            }
                            .rjsf-form-wrapper textarea.form-control {
                              min-height: 80px !important;
                              resize: vertical !important;
                            }
                            .rjsf-form-wrapper select.form-control {
                              appearance: none !important;
                              background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e") !important;
                              background-position: right 8px center !important;
                              background-repeat: no-repeat !important;
                              background-size: 16px 16px !important;
                              padding-right: 32px !important;
                            }
                          `}</style>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Execution Button */}
                      <div className="flex justify-end pt-2 border-t">
                        <Button
                          onClick={() => handleExecuteTool(toolFormData)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Execute Tool
                        </Button>
                      </div>

                      {/* Results Section */}
                      {executionResults[selectedTool] && (
                        <div className="space-y-3 pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-foreground">
                              Execution Result
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {new Date(
                                  executionResults[selectedTool].timestamp,
                                ).toLocaleTimeString()}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyResult(selectedTool)}
                                className="h-7 px-2"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <ScrollArea className="h-32 w-full bg-muted/50 border rounded-lg p-3">
                            <pre className="text-xs font-mono whitespace-pre-wrap text-foreground">
                              {safeStringify(
                                executionResults[selectedTool].result,
                              )}
                            </pre>
                          </ScrollArea>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="bg-muted/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Play className="h-8 w-8" />
                      </div>
                      <p className="text-sm font-medium">No Tool Selected</p>
                      <p className="text-xs mt-1">
                        Choose a tool from the list to configure and execute it
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Prompts View */}
          {activeView === 'prompts' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search prompts..."
                    value={promptSearchQuery}
                    onChange={(e) => setPromptSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid gap-3">
                {filteredPrompts.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No prompts found</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredPrompts.map((prompt) => {
                    const promptInfo = promptsMap[prompt];
                    const hasResult = executionResults[prompt];
                    const isExpanded = expandedPrompts.has(prompt);

                    return (
                      <Card key={prompt}>
                        <Collapsible>
                          <CollapsibleTrigger
                            className="w-full"
                            onClick={() => togglePromptExpanded(prompt)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                  <span className="font-medium">{prompt}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {hasResult && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      Executed
                                    </Badge>
                                  )}
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleExecutePrompt(prompt);
                                    }}
                                  >
                                    <Play className="h-4 w-4 mr-2" />
                                    Execute
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="pt-0 space-y-3">
                              {promptInfo?.description && (
                                <p className="text-sm text-muted-foreground">
                                  {promptInfo.description}
                                </p>
                              )}

                              {hasResult && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium">
                                      Result
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyResult(prompt)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <ScrollArea className="h-24 w-full bg-muted p-3 rounded text-xs">
                                    <pre className="whitespace-pre-wrap">
                                      {safeStringify(
                                        executionResults[prompt].result,
                                      )}
                                    </pre>
                                  </ScrollArea>
                                </div>
                              )}
                            </CardContent>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Resources View */}
          {activeView === 'resources' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search resources..."
                    value={resourceSearchQuery}
                    onChange={(e) => setResourceSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid gap-3">
                {filteredResources.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8 text-muted-foreground">
                      <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No resources found</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredResources.map((resource) => {
                    const hasResult = executionResults[resource];

                    return (
                      <Card key={resource}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{resource}</p>
                              <p className="text-sm text-muted-foreground">
                                Resource URI
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {hasResult && (
                                <Badge variant="secondary" className="text-xs">
                                  Loaded
                                </Badge>
                              )}
                              <Button
                                size="sm"
                                onClick={() => handleReadResource(resource)}
                              >
                                <Database className="h-4 w-4 mr-2" />
                                Read
                              </Button>
                            </div>
                          </div>

                          {hasResult && (
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-medium">
                                  Content
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyResult(resource)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                              <ScrollArea className="h-32 w-full bg-muted p-3 rounded text-xs">
                                <pre className="whitespace-pre-wrap">
                                  {safeStringify(
                                    executionResults[resource].result,
                                  )}
                                </pre>
                              </ScrollArea>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
