import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { PostMessageMCPTransport } from "@nuwa-ai/ui-kit";
import { useCallback, useId, useRef, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

export function MCPUIDebug() {
  const [isConnected, setIsConnected] = useState(false);
  const [tools, setTools] = useState<Array<{ name: string; description?: string; inputSchema?: any }>>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [toolResult, setToolResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [childServerUrl, setChildServerUrl] = useState("http://localhost:3000/note");
  const [toolParams, setToolParams] = useState<Record<string, Record<string, string>>>({});

  const urlInputId = useId();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const mcpClientRef = useRef<Client | null>(null);
  const transportRef = useRef<PostMessageMCPTransport | null>(null);

  const addLog = useCallback((message: string) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  }, []);

  const connectToChild = async () => {
    try {
      setIsLoading(true);
      addLog("🔌 Initializing MCP client connection...");

      if (!iframeRef.current?.contentWindow) {
        throw new Error("Iframe not ready");
      }

      // Wait a bit for iframe to fully load
      await new Promise(resolve => setTimeout(resolve, 1000));
      addLog("⏳ Waiting for iframe to initialize...");

      // Create transport
      const transport = new PostMessageMCPTransport({
        targetWindow: iframeRef.current.contentWindow,
        targetOrigin: "*",
        allowedOrigins: ["*"],
        debug: true,
        timeout: 10000
      });
      transportRef.current = transport;

      // Create MCP client
      const client = new Client(
        {
          name: "capui-demo-parent",
          version: "1.0.0"
        },
        {
          capabilities: {
            tools: {}
          }
        }
      );
      mcpClientRef.current = client;

      // Connect transport
      await client.connect(transport);
      addLog("✅ MCP transport connected");

      // List available tools
      const toolsResult = await client.listTools();
      setTools(toolsResult.tools || []);
      addLog(`🛠️ Found ${toolsResult.tools?.length || 0} tools`);

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

      setIsConnected(true);
    } catch (error) {
      addLog(`❌ Connection failed: ${error}`);
      console.error("MCP connection error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = async () => {
    try {
      if (mcpClientRef.current) {
        await mcpClientRef.current.close();
        mcpClientRef.current = null;
      }
      if (transportRef.current) {
        await transportRef.current.close();
        transportRef.current = null;
      }
      setIsConnected(false);
      setTools([]);
      setToolResult("");
      setToolParams({});
      addLog("🔌 Disconnected from MCP server");
    } catch (error) {
      addLog(`❌ Disconnect error: ${error}`);
    }
  };

  const callTool = async (toolName: string) => {
    try {
      setIsLoading(true);
      addLog(`🔧 Calling tool: ${toolName}`);

      if (!mcpClientRef.current) {
        throw new Error("MCP client not connected");
      }

      // Get parameters from state, filter out empty values
      const args = Object.fromEntries(
        Object.entries(toolParams[toolName] || {})
          .filter(([, value]) => value.trim() !== "")
      );

      const result = await mcpClientRef.current.callTool({
        name: toolName,
        arguments: args
      });

      setToolResult(JSON.stringify(result, null, 2));
      addLog(`✅ Tool ${toolName} executed successfully`);
    } catch (error) {
      const errorMessage = `❌ Tool call failed: ${error}`;
      addLog(errorMessage);
      setToolResult(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateToolParam = (toolName: string, paramName: string, value: string) => {
    setToolParams(prev => ({
      ...prev,
      [toolName]: {
        ...prev[toolName],
        [paramName]: value
      }
    }));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>MCP Parent Demo</CardTitle>
          <CardDescription>
            Uses official MCP SDK Client with PostMessageMCPTransport to
            communicate with child iframe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor={urlInputId}>Child Server URL</Label>
              <Input
                id={urlInputId}
                type="url"
                placeholder="http://localhost:5177/"
                value={childServerUrl}
                onChange={(e) => setChildServerUrl(e.target.value)}
                disabled={isConnected}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={connectToChild}
                disabled={isConnected || isLoading || !childServerUrl.trim()}
                variant="primary"
              >
                {isLoading ? "Connecting..." : "Connect to Child"}
              </Button>
              <Button
                onClick={disconnect}
                disabled={!isConnected}
                variant="destructive"
              >
                Disconnect
              </Button>
            </div>
          </div>

          {/* Main content area with tools on left, iframe on right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Tools panel - Left side */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Available Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {tools.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        {isConnected ? "No tools available" : "Connect to see tools"}
                      </p>
                    ) : (
                      tools.map((tool) => {
                        const toolSchema = tool.inputSchema?.properties || {};
                        const hasParams = Object.keys(toolSchema).length > 0;

                        return (
                          <Card key={tool.name} className="border-2">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-base">{tool.name}</CardTitle>
                                  <CardDescription className="text-sm">
                                    {tool.description || 'No description'}
                                  </CardDescription>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => callTool(tool.name)}
                                  disabled={isLoading}
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
                                  {Object.entries(toolSchema).map(([paramName, paramDef]: [string, any]) => {
                                    const paramId = `${tool.name}-${paramName}`;
                                    return (
                                      <div key={paramName} className="grid w-full items-center gap-1.5">
                                        <Label htmlFor={paramId} className="text-xs">
                                          {paramName}
                                          {paramDef.type && (
                                            <span className="text-muted-foreground ml-1">({paramDef.type})</span>
                                          )}
                                        </Label>
                                        <Input
                                          id={paramId}
                                          size={10}
                                          placeholder={paramDef.description || `Enter ${paramName}`}
                                          value={toolParams[tool.name]?.[paramName] || ""}
                                          onChange={(e) => updateToolParam(tool.name, paramName, e.target.value)}
                                          className="text-xs h-8"
                                        />
                                      </div>
                                    );
                                  })}
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
            </div>

            {/* Child iframe - Right side */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Child MCP Server</CardTitle>
                </CardHeader>
                <CardContent className="h-full pb-6">
                  <iframe
                    ref={iframeRef}
                    src={childServerUrl}
                    className="w-full h-full border rounded-md"
                    title="MCP Child Demo"
                    onLoad={() => addLog("📱 Iframe loaded successfully")}
                    onError={() => addLog("❌ Iframe failed to load")}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tool result */}
          {toolResult && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Tool Result</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto whitespace-pre-wrap">
                  {toolResult}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Logs */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Connection Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-md text-sm h-32 overflow-y-auto font-mono">
                {logs.map((log, index) => (
                  <div key={`log-${Date.now()}-${index}`}>{log}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
