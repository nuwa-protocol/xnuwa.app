import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import {
  ChevronDown,
  ChevronRight,
  Code,
  Copy,
  Database,
  FileText,
  Play,
  Search,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/shared/components';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Input,
  ScrollArea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
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
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());
  const [expandedPrompts, setExpandedPrompts] = useState<Set<string>>(
    new Set(),
  );

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

  const toggleToolExpanded = (toolName: string) => {
    setExpandedTools((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(toolName)) {
        newSet.delete(toolName);
      } else {
        newSet.add(toolName);
      }
      return newSet;
    });
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

  const filteredTools = tools.filter((tool) =>
    tool.toLowerCase().includes(toolSearchQuery.toLowerCase()),
  );

  const filteredPrompts = prompts.filter((prompt) =>
    prompt.toLowerCase().includes(promptSearchQuery.toLowerCase()),
  );

  const filteredResources = resources.filter((resource) =>
    resource.toLowerCase().includes(resourceSearchQuery.toLowerCase()),
  );

  return (
    <Tabs defaultValue="tools" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="tools" className="flex items-center">
          <Code className="h-4 w-4 mr-2" />
          Tools ({tools.length})
        </TabsTrigger>
        <TabsTrigger value="prompts" className="flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          Prompts ({prompts.length})
        </TabsTrigger>
        <TabsTrigger value="resources" className="flex items-center">
          <Database className="h-4 w-4 mr-2" />
          Resources ({resources.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="tools" className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              value={toolSearchQuery}
              onChange={(e) => setToolSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Tools List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Available Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {filteredTools.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <Code className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No tools found</p>
                    </div>
                  ) : (
                    filteredTools.map((tool) => {
                      const isExpanded = expandedTools.has(tool);
                      const toolInfo = toolsMap[tool];
                      const hasResult = executionResults[tool];

                      return (
                        <Card
                          key={tool}
                          className={cn(
                            'cursor-pointer transition-colors',
                            selectedTool === tool && 'ring-2 ring-primary',
                          )}
                        >
                          <Collapsible>
                            <CollapsibleTrigger
                              className="w-full p-3 text-left"
                              onClick={() => toggleToolExpanded(tool)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                  <span className="font-medium">{tool}</span>
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
                                    variant={
                                      selectedTool === tool
                                        ? 'default'
                                        : 'outline'
                                    }
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTool(tool);
                                    }}
                                  >
                                    Select
                                  </Button>
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="px-3 pb-3 space-y-2 border-t">
                                {toolInfo?.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {toolInfo.description}
                                  </p>
                                )}
                                <div className="text-xs text-muted-foreground">
                                  Parameters:{' '}
                                  {toolInfo?.parameters
                                    ? Object.keys(
                                        toolInfo.parameters.properties || {},
                                      ).length
                                    : 0}
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </Card>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Tool Execution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {selectedTool ? `Execute: ${selectedTool}` : 'Select a Tool'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTool ? (
                <div className="space-y-4">
                  {(() => {
                    const tool = toolsMap[selectedTool];
                    const paramWrapper = tool?.parameters;
                    const schema = paramWrapper?.jsonSchema ?? paramWrapper;

                    if (!schema) {
                      return (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            This tool has no parameters.
                          </p>
                          <Button onClick={() => handleExecuteTool({})}>
                            <Play className="h-4 w-4 mr-2" />
                            Execute
                          </Button>
                        </div>
                      );
                    }

                    return (
                      <Form
                        schema={schema}
                        formData={toolFormData}
                        validator={validator}
                        onChange={(e) => setToolFormData(e.formData)}
                        onSubmit={handleExecuteTool}
                      >
                        <Button type="submit">
                          <Play className="h-4 w-4 mr-2" />
                          Execute
                        </Button>
                      </Form>
                    );
                  })()}

                  {executionResults[selectedTool] && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Latest Result</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyResult(selectedTool)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <ScrollArea className="h-32 w-full bg-muted p-3 rounded text-xs font-mono">
                        <pre className="whitespace-pre-wrap">
                          {safeStringify(executionResults[selectedTool].result)}
                        </pre>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a tool to configure and execute it</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="prompts" className="space-y-4">
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
                              <Badge variant="secondary" className="text-xs">
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
                              <div className="text-sm font-medium">Result</div>
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
                                {safeStringify(executionResults[prompt].result)}
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
      </TabsContent>

      <TabsContent value="resources" className="space-y-4">
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
                          <div className="text-sm font-medium">Content</div>
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
                            {safeStringify(executionResults[resource].result)}
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
      </TabsContent>
    </Tabs>
  );
}
