// to fix: need to unify the MCP client


import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { PostMessageMCPTransport } from '@nuwa-ai/ui-kit';
import {
  ArrowLeft,
  BrushCleaning,
  Copy,
  Plug,
  RefreshCw,
  Search,
  Terminal,
  Unplug,
} from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui';
import {
  closeNuwaMCPClient,
  createNuwaMCPClient,
} from '@/shared/services/mcp-client';
import type { NuwaMCPClient } from '@/shared/types';
import type { LocalCap } from '../../types';

interface LogEntry {
  id: string;
  type: 'info' | 'error' | 'success' | 'warning' | 'result';
  message: string;
  timestamp: number;
  data?: any;
  copyable?: boolean;
}

interface McpProps {
  cap?: LocalCap | null;
  serverName?: string | null;
}

type MCPType = 'MCP Server' | 'MCP UI';

export function Mcp({ cap, serverName }: McpProps) {
  const navigate = useNavigate();
  const serverUrlId = useId();
  const mcpTypeId = useId();
  const [url, setUrl] = useState('');
  const [mcpType, setMcpType] = useState<MCPType>('MCP Server');
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [client, setClient] = useState<NuwaMCPClient | Client | null>(null);
  const [tools, setTools] = useState<Record<string, any>>({});
  const [toolParams, setToolParams] = useState<
    Record<string, Record<string, string>>
  >({});
  const [toolSearch, setToolSearch] = useState<string>('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isCallingTool, setIsCallingTool] = useState(false);
  const [showUIPreview, setShowUIPreview] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeUrl, setIframeUrl] = useState<string>('');

  const pushLog = useCallback((entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    setLogs((prev) =>
      [
        {
          ...entry,
          id: `log_${Date.now()}_${Math.random()}`,
          timestamp: Date.now(),
        },
        ...prev,
      ].slice(0, 100),
    ); // Keep last 100 logs
  }, []);

  // Auto-populate connection details when server is specified via URL parameter
  useEffect(() => {
    if (cap && serverName && cap.capData.core.mcpServers[serverName]) {
      const serverConfig = cap.capData.core.mcpServers[serverName];
      setUrl(serverConfig.url);
    }
  }, [cap, serverName, pushLog]);

  const handleConnectMCPUI = useCallback(async () => {
    try {
      setConnecting(true);
      pushLog({
        type: 'info',
        message: `Connecting to ${url} with PostMessage transport`,
      });
      if (!iframeRef.current?.contentWindow) {
        throw new Error('Iframe not ready');
      }

      // Wait a bit for iframe to fully load
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create transport
      const transport = new PostMessageMCPTransport({
        targetWindow: iframeRef.current.contentWindow,
        targetOrigin: '*',
        allowedOrigins: ['*'],
        debug: true,
        timeout: 10000,
      });

      // Create MCP client
      const client = new Client(
        {
          name: 'capui-demo-parent',
          version: '1.0.0',
        },
        {
          capabilities: {
            tools: {},
          },
        },
      );

      // Connect transport
      await client.connect(transport);
      setClient(client);

      // Fetch tools
      // List available tools
      const toolsResult = await client.listTools();
      setTools(toolsResult.tools || []);
      pushLog({
        type: 'info',
        message: `🛠️ Found ${toolsResult.tools?.length || 0} tools`,
      });

      console.log('toolsResult', toolsResult);

      // Initialize tool parameters
      const initialParams: Record<string, Record<string, string>> = {};
      toolsResult.tools?.forEach(tool => {
        initialParams[tool.name] = {};
        // Initialize parameters based on input schema if available
        if (tool.inputSchema?.properties) {
          Object.keys(tool.inputSchema.properties).forEach(param => {
            initialParams[tool.name][param] = "";
          });
        }
      });
      setToolParams(initialParams);

      pushLog({
        type: 'success',
        message: '✅ MCP transport connected',
      });


      setConnected(true);
    } catch (error) {
      pushLog({
        type: 'error',
        message: `❌ Connection failed: ${error}`,
      });
      console.error('MCP connection error:', error);
    } finally {
      setConnecting(false);
    }
  }, [connecting, pushLog]);

  const handleConnectMCPServer = useCallback(async () => {
    if (connecting) return;

    setConnecting(true);
    try {
      pushLog({
        type: 'info',
        message: `Connecting to ${url} with Streamable HTTP transport`,
      });

      const newClient = await createNuwaMCPClient(url);

      setClient(newClient);

      pushLog({
        type: 'success',
        message: 'Successfully connected to MCP server',
      });

      // Fetch server capabilities
      const toolsList = await newClient.tools();
      setTools(toolsList);
      pushLog({
        type: 'info',
        message: `Discovered ${Object.keys(toolsList).length} tools`,
        data: { tools: Object.keys(toolsList) },
      });

      // Initialize tool parameters
      const initialParams: Record<string, Record<string, string>> = {};
      Object.entries(toolsList).forEach(([toolName, tool]) => {
        initialParams[toolName] = {};
        // Initialize parameters based on input schema if available
        if (tool.parameters.jsonSchema) {
          Object.keys(tool.parameters.jsonSchema.properties).forEach(
            (param) => {
              initialParams[toolName][param] = '';
            },
          );
        }
      });

      setToolParams(initialParams);

      toast.success(`Successfully connected to ${url}`);
      setConnected(true);
    } catch (err) {
      pushLog({
        type: 'error',
        message: `Connection failed: ${String(err)}`,
      });

      toast.error(String(err));

      await closeNuwaMCPClient(url);
    } finally {
      setConnecting(false);
    }
  }, [connecting, url, pushLog]);

  const handleDisconnect = async () => {
    if (!client) return;

    try {
      await client.close();
      setClient(null);
      setConnected(false);
      setTools({});

      pushLog({
        type: 'info',
        message: 'Disconnected from MCP server',
      });

      toast.success('Successfully disconnected from MCP server');
    } catch (err) {
      pushLog({
        type: 'error',
        message: `Disconnect error: ${String(err)}`,
      });
    }
  };

  const callTool = async (toolName: string) => {
    try {
      setIsCallingTool(true);
      pushLog({
        type: 'info',
        message: `🔧 Calling tool: ${toolName}`,
      });

      if (!client) {
        throw new Error('MCP client not connected');
      }

      // Get parameters from state, filter out empty values
      const args = Object.fromEntries(
        Object.entries(toolParams[toolName] || {}).filter(
          ([, value]) => value.trim() !== '',
        ),
      );

      const result = await tools[toolName].execute(args);

      pushLog({
        type: 'result',
        message: JSON.stringify(result, null, 2),
        data: { result },
        copyable: true,
      });

      pushLog({
        type: 'success',
        message: `✅ Tool ${toolName} executed successfully`,
      });
    } catch (error) {
      const errorMessage = `❌ Tool call failed: ${error}`;
      pushLog({
        type: 'error',
        message: errorMessage,
        copyable: true,
      });
    } finally {
      setIsCallingTool(false);
    }
  };

  const updateToolParam = (
    toolName: string,
    paramName: string,
    value: string,
  ) => {
    setToolParams((prev) => ({
      ...prev,
      [toolName]: {
        ...prev[toolName],
        [paramName]: value,
      },
    }));
  };

  const copyLogEntry = async (logMessage: string) => {
    try {
      await navigator.clipboard.writeText(logMessage);
      toast.success('Log entry copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy log entry to clipboard');
    }
  };

  // Filter tools based on search
  const filteredTools = Object.entries(tools).filter(
    ([toolName, tool]) =>
      toolName.toLowerCase().includes(toolSearch.toLowerCase()) ||
      tool.description?.toLowerCase().includes(toolSearch.toLowerCase()),
  );

  const clearLogs = () => {
    setLogs([]);
  };

  const copyLogs = async () => {
    const logText = logs
      .map(
        (log) =>
          `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.type.toUpperCase()}: ${log.message}`,
      )
      .join('\n');

    try {
      await navigator.clipboard.writeText(logText);
      toast.success('Debug logs copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy logs to clipboard');
    }
  };

  return (
    <div
      className={`flex gap-6 ${mcpType === 'MCP UI' ? '' : 'max-w-3xl mx-auto'}`}
    >
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">MCP Tools</h3>
            <p className="text-sm text-muted-foreground">
              Test and debug Model Context Protocol connections and tools
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>

        {/* Connection Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Plug className="h-5 w-5 mr-2" />
              MCP Connection
            </CardTitle>
            <CardDescription className="text-sm">
              Connect to an MCP server to access tools and resources. Only
              Streamable HTTP transport is supported.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Connection Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor={mcpTypeId}
                  className="text-sm font-medium text-foreground"
                >
                  MCP Type
                </label>
                <Select
                  value={mcpType}
                  onValueChange={(value) => setMcpType(value as MCPType)}
                  disabled={connecting || connected}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select MCP Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MCP Server">MCP Server</SelectItem>
                    <SelectItem value="MCP UI">MCP UI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor={serverUrlId}
                  className="text-sm font-medium text-foreground"
                >
                  URL
                </label>
                <Input
                  id={serverUrlId}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="http://example.com/mcp"
                  disabled={connecting || connected}
                  className="h-10"
                />
              </div>
            </div>

            {/* Connection Status */}
            {(connected || connecting) && (
              <div className="space-y-3">
                {connected && (
                  <div className="flex items-center space-x-3 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 px-4 py-3 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <span className="font-medium">Connected to {url}</span>
                      <div className="text-xs text-green-600 dark:text-green-500 mt-1">
                        {Object.keys(tools).length} tools available
                      </div>
                    </div>
                    <Plug className="h-4 w-4" />
                  </div>
                )}

                {connecting && (
                  <div className="flex items-center space-x-3 text-sm text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-4 py-3 rounded-lg">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="font-medium">Connecting to {url}...</span>
                  </div>
                )}
              </div>
            )}

            {/* Connection Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                {/* Launch UI Button - only show for MCP UI type and when not connected */}
                {mcpType === 'MCP UI' && !connected && !connecting && (
                  <Button
                    onClick={() => {
                      setShowUIPreview(true);
                      setIframeUrl(url);
                    }}
                    variant="outline"
                    size="default"
                    className="min-w-32"
                    disabled={!url.trim()}
                  >
                    Launch UI
                  </Button>
                )}

                {connected ? (
                  <Button
                    onClick={handleDisconnect}
                    variant="destructive"
                    size="default"
                    className="min-w-32"
                  >
                    <Unplug className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    onClick={
                      mcpType === 'MCP Server'
                        ? handleConnectMCPServer
                        : handleConnectMCPUI
                    }
                    disabled={connecting || !url.trim()}
                    size="default"
                    className="min-w-32"
                  >
                    {connecting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Plug className="h-4 w-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tools */}
        {connected && client && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    Available Tools ({Object.keys(tools).length})
                  </CardTitle>
                  <CardDescription>
                    {filteredTools.length < Object.keys(tools).length
                      ? `Showing ${filteredTools.length} of ${Object.keys(tools).length} tools`
                      : Object.keys(tools).length === 0
                        ? 'No tools available'
                        : 'All tools shown'}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tools..."
                      value={toolSearch}
                      onChange={(e) => setToolSearch(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredTools.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    {Object.keys(tools).length === 0
                      ? 'No tools available'
                      : 'No tools match your search'}
                  </p>
                ) : (
                  filteredTools.map(([toolName, tool]) => {
                    const toolSchema =
                      tool.parameters.jsonSchema?.properties || {};
                    const requiredParams =
                      tool.parameters.jsonSchema?.required || [];
                    const hasParams = Object.keys(toolSchema).length > 0;

                    return (
                      <Card key={toolName} className="border-2">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base">
                                {toolName}
                              </CardTitle>
                              <CardDescription className="text-sm">
                                {tool.description || 'No description'}
                              </CardDescription>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => callTool(toolName)}
                              disabled={isCallingTool}
                            >
                              Call
                            </Button>
                          </div>
                        </CardHeader>
                        {hasParams && (
                          <CardContent className="pt-0">
                            <div className="space-y-3">
                              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Parameters
                              </div>
                              {Object.entries(toolSchema).map(
                                ([paramName, paramDef]: [string, any]) => {
                                  const paramId = `${toolName}-${paramName}`;
                                  return (
                                    <div
                                      key={paramName}
                                      className="grid w-full items-center gap-1.5"
                                    >
                                      <Label
                                        htmlFor={paramId}
                                        className="text-xs"
                                      >
                                        {paramName}
                                        {paramDef.type && (
                                          <span className="text-muted-foreground ml-1">
                                            ({paramDef.type}){' '}
                                            {requiredParams.includes(paramName)
                                              ? ' (required)'
                                              : ''}
                                          </span>
                                        )}
                                      </Label>
                                      <Input
                                        id={paramId}
                                        size={10}
                                        placeholder={
                                          paramDef.description ||
                                          `Enter ${paramName}`
                                        }
                                        value={
                                          toolParams[toolName][paramName] || ''
                                        }
                                        onChange={(e) =>
                                          updateToolParam(
                                            toolName,
                                            paramName,
                                            e.target.value,
                                          )
                                        }
                                        className="text-xs h-8"
                                      />
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Debug Logs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center">
                  <Terminal className="h-4 w-4 mr-2" />
                  Debug Logs
                </CardTitle>
                <CardDescription>
                  Real-time logging of MCP operations
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={copyLogs}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={clearLogs}>
                  <BrushCleaning className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64 w-full rounded-md border bg-muted/30 p-4">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No debug logs yet</p>
                  <p className="text-xs">Connect to a server to see logs</p>
                </div>
              ) : (
                <div className="space-y-1 font-mono text-sm">
                  {logs.map((log) => {
                    const getLogColor = (type: string) => {
                      switch (type) {
                        case 'error':
                          return 'text-red-600';
                        case 'warning':
                          return 'text-yellow-600';
                        case 'success':
                          return 'text-green-600';
                        case 'info':
                          return 'text-blue-600';
                        case 'result':
                          return 'text-purple-600';
                        default:
                          return 'text-foreground';
                      }
                    };

                    const getLogIcon = (type: string) => {
                      switch (type) {
                        case 'error':
                          return '❌';
                        case 'warning':
                          return '⚠️';
                        case 'success':
                          return '✅';
                        case 'info':
                          return 'ℹ️';
                        case 'result':
                          return '📋';
                        default:
                          return '•';
                      }
                    };

                    return (
                      <div
                        key={log.id}
                        className="flex items-start space-x-2 group"
                      >
                        <span className="text-muted-foreground text-xs mt-0.5 w-20 flex-shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="mt-0.5">{getLogIcon(log.type)}</span>
                        <div className="flex-1 flex items-start justify-between">
                          <span
                            className={`${getLogColor(log.type)} flex-1 break-words ${log.type === 'result' ? 'font-mono text-xs' : ''
                              }`}
                          >
                            {log.message}
                          </span>
                          {log.copyable && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 ml-2 flex-shrink-0"
                              onClick={() => copyLogEntry(log.message)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* UI Preview - Right Side Panel */}
      {mcpType === 'MCP UI' && (
        <div className="w-2/3 space-y-4">
          <Card className="h-full border-none shadow-none">
            <CardHeader>
              <CardTitle>UI Preview</CardTitle>
            </CardHeader>
            <CardContent className="h-[800px] pb-6">
              {iframeUrl && showUIPreview ? (
                <iframe
                  ref={iframeRef}
                  src={iframeUrl}
                  className="w-full h-full border border-muted rounded-md shadow-md"
                  title="MCP UI Preview"
                  onLoad={() =>
                    pushLog({
                      type: 'info',
                      message: '📱 UI Preview loaded successfully',
                    })
                  }
                />
              ) : (
                <div className="text-muted-foreground text-center py-8 space-y-2">
                  {!url ? (
                    <p>Enter a URL to preview the MCP UI</p>
                  ) : (
                    <>
                      <p>Click "Launch UI" to preview the interface</p>
                      <p className="text-xs">
                        or connect to load automatically
                      </p>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
