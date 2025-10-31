import type { Cap } from '@/shared/types';
import { createX402MCPClient } from '../../x402/x402-mcp-client';

interface RemoteMCPInstance {
  clients: Map<string, any>;
  tools: Record<string, any>;
  initialized: boolean;
}

class RemoteMCPManager {
  private static instance: RemoteMCPManager;
  private currentInstance: RemoteMCPInstance | null = null;
  private currentCapId: string | null = null;

  private constructor() {}

  static getInstance(): RemoteMCPManager {
    if (!RemoteMCPManager.instance) {
      RemoteMCPManager.instance = new RemoteMCPManager();
    }
    return RemoteMCPManager.instance;
  }

  async initializeForCap(cap: Cap): Promise<Record<string, any>> {
    // If already initialized for this cap, return existing tools
    if (
      this.currentInstance &&
      this.currentCapId === cap.id &&
      this.currentInstance.initialized
    ) {
      return this.currentInstance.tools;
    }

    // Clean up existing instance if switching caps
    if (this.currentInstance && this.currentCapId !== cap.id) {
      await this.cleanup();
    }

    // Initialize new MCP instance for the cap
    const clients = new Map<string, any>();
    const mcpServers = cap.core.mcpServers || {};

    // Track initialization progress; mark instance but keep it uninitialized for now
    this.currentInstance = {
      clients,
      tools: {},
      initialized: false,
    };
    this.currentCapId = cap.id;

    try {
      // Initialize all MCP clients using unified client
      for (const [serverName, server] of Object.entries(mcpServers)) {
        // Use unified MCP client which automatically detects server type
        const client = await createX402MCPClient(server);
        clients.set(serverName, client);
      }

      // Get all tools from initialized clients
      const allTools: Record<string, any> = {};
      for (const [serverName, client] of clients.entries()) {
        const serverTools = await client.tools();
        for (const [toolName, toolDefinition] of Object.entries(serverTools)) {
          const prefixedToolName = `${serverName}_${toolName}`;
          // Preserve the original tool structure, especially the type property
          const enhancedTool = Object.assign(toolDefinition as object, {
            _serverName: serverName,
            _originalName: toolName,
          });
          allTools[prefixedToolName] = enhancedTool;
        }
      }

      this.currentInstance.tools = allTools;
      this.currentInstance.initialized = true;

      return allTools;
    } catch (error) {
      // Ensure clients opened during this attempt are closed so retries start fresh
      const closePromises: Promise<void>[] = [];
      for (const [serverName, client] of clients.entries()) {
        if (client?.close) {
          closePromises.push(
            client
              .close()
              .catch((closeError: unknown) => {
                console.warn(
                  `Failed to close MCP client ${serverName}:`,
                  closeError,
                );
              })
              .then(() => undefined),
          );
        }
      }
      await Promise.allSettled(closePromises);

      // Reset cached instance so future retries reattempt full initialization
      if (this.currentCapId === cap.id) {
        this.currentInstance = null;
        this.currentCapId = null;
      }

      throw error;
    }
  }

  async cleanup(): Promise<void> {
    if (this.currentInstance?.initialized) {
      try {
        for (const [
          serverName,
          client,
        ] of this.currentInstance.clients.entries()) {
          try {
            await client.close();
          } catch (error) {
            throw new Error(
              `Failed to close MCP client ${serverName}: ${error}`,
            );
          }
        }
      } catch (error) {
        throw new Error(`Error closing MCP connections: ${error}`);
      }
    }

    this.currentInstance = null;
    this.currentCapId = null;
  }

  getCurrentTools(): Record<string, any> {
    return this.currentInstance?.tools || {};
  }

  isInitialized(): boolean {
    return this.currentInstance?.initialized || false;
  }
}

export { RemoteMCPManager };
