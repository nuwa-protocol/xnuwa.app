import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { PostMessageMCPTransport } from "@nuwa-ai/capui-kit";
import { useCallback, useRef, useState } from "react";

export function MCPParentDemo() {
  const [isConnected, setIsConnected] = useState(false);
  const [tools, setTools] = useState<Array<{ name: string; description?: string }>>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [toolResult, setToolResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const mcpClientRef = useRef<Client | null>(null);
  const transportRef = useRef<PostMessageMCPTransport | null>(null);

  // Use environment variable for child server URL, fallback to localhost:5175 
  const childServerUrl = "http://localhost:5177/";

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

      let args = {};
      if (toolName === "get_weather") {
        args = { location: "San Francisco" };
      } else if (toolName === "calculate") {
        args = { expression: "2 + 2" };
      }

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">MCP Parent Demo</h2>
        <p className="text-sm text-gray-600 mb-4">
          Uses official MCP SDK Client with PostMessageMCPTransport to
          communicate with child iframe
        </p>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={connectToChild}
            disabled={isConnected || isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isLoading ? "Connecting..." : "Connect to Child"}
          </button>
          <button
            type="button"
            onClick={disconnect}
            disabled={!isConnected}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            Disconnect
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Child iframe */}
          <div>
            <h3 className="font-medium mb-2">Child MCP Server (iframe)</h3>
            <iframe
              ref={iframeRef}
              src={childServerUrl}
              className="w-full h-64 border rounded"
              title="MCP Child Demo"
              onLoad={() => addLog("📱 Iframe loaded successfully")}
              onError={() => addLog("❌ Iframe failed to load")}
            />
          </div>

          {/* Tools panel */}
          <div>
            <h3 className="font-medium mb-2">Available Tools</h3>
            <div className="border rounded p-4 h-64 overflow-y-auto bg-gray-50">
              {tools.length === 0 ? (
                <p className="text-gray-500">
                  {isConnected ? "No tools available" : "Connect to see tools"}
                </p>
              ) : (
                <div className="space-y-2">
                  {tools.map((tool) => (
                    <div
                      key={tool.name}
                      className="flex items-center justify-between bg-white p-2 rounded"
                    >
                      <div>
                        <div className="font-medium">{tool.name}</div>
                        <div className="text-sm text-gray-600">
                          {tool.description || 'No description'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => callTool(tool.name)}
                        disabled={isLoading}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
                      >
                        Call
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tool result */}
        {toolResult && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Tool Result</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
              {toolResult}
            </pre>
          </div>
        )}

        {/* Logs */}
        <div className="mt-4">
          <h3 className="font-medium mb-2">Connection Logs</h3>
          <div className="bg-gray-900 text-green-400 p-4 rounded text-sm h-32 overflow-y-auto font-mono">
            {logs.map((log, index) => (
              <div key={`log-${Date.now()}-${index}`}>{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
