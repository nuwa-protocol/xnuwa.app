import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { IdentityKitWeb } from '@nuwa-ai/identity-kit-web';
import {
  createMcpClient,
  type McpServerType,
  type UniversalMcpClient,
} from '@nuwa-ai/payment-kit';
import { PostMessageMCPTransport } from '@nuwa-ai/ui-kit';
import type {
  NuwaMCPClient,
  PromptDefinition,
  PromptMessagesResult,
  ResourceDefinition,
  ResourceTemplateDefinition,
} from '../types/mcp-client';
import { MCPError } from '../types/mcp-client';
import {
  getMCPAuthResourceMetadata,
  handleUahtorized,
  StreamableHTTPTransportOAuthProvider,
} from './mcp-oauth-provider';

/**
 * Adapter that wraps UniversalMcpClient to provide NuwaMCPClient interface
 * This enables seamless integration with existing MCP client usage patterns
 * while supporting both payment-enabled and standard MCP servers.
 */
export class UnifiedMcpClientAdapter implements NuwaMCPClient {
  constructor(
    private universalClient: UniversalMcpClient,
    private readonly transport: any,
  ) {}

  get raw() {
    return this.universalClient;
  }

  /**
   * Generic auth retry wrapper that attempts to retry a function once after OAuth completion
   */
  private async withAuthRetry<T>(
    fn: () => Promise<T>,
    context: string,
  ): Promise<T> {
    try {
      return await fn();
    } catch (err: any) {
      // Check if this is an auth error that we can retry
      if (err?.toString().includes('Unauthorized')) {
        // Wait for OAuth completion and retry once
        const authCode = await handleUahtorized();
        if (typeof this.transport?.finishAuth === 'function') {
          await this.transport.finishAuth(authCode);
        }

        // Streamable transports cannot be restarted once started without a reset.
        if (typeof this.transport?.close === 'function') {
          try {
            await this.transport.close();
          } catch (transportCloseErr) {
            console.warn('Failed to close MCP transport after OAuth', transportCloseErr);
          }
        }
        // The underlying SDK leaves the abort controller set after close(); clear it
        // so a subsequent connect() call can start the transport again.
        if (this.transport && '_abortController' in this.transport) {
          this.transport._abortController = undefined;
        }

        // The universal client caches server detection state. If initialization
        // failed because of auth, force it to rebuild now that we have tokens.
        if (typeof this.universalClient?.redetect === 'function') {
          try {
            await this.universalClient.redetect();
          } catch (redetectErr) {
            console.warn('Failed to reinitialize MCP client after OAuth', redetectErr);
          }
        }

        // Retry the original function once
        try {
          return await fn();
        } catch (retryErr: any) {
          console.log('retry error', retryErr);
          return this.handleError(context, retryErr);
        }
      } else {
        return this.handleError(context, err);
      }
    }
  }

  async tools(): Promise<Record<string, any>> {
    return this.withAuthRetry(() => {
      console.log('listing tools');
      return this.universalClient.tools();
    }, 'Failed to list tools');
  }

  async prompts(): Promise<Record<string, PromptDefinition>> {
    return this.withAuthRetry(async () => {
      const result = await this.universalClient.listPrompts();
      const promptsMap: Record<string, PromptDefinition> = {};

      if (result && Array.isArray(result.prompts)) {
        for (const prompt of result.prompts) {
          if (prompt?.name) {
            promptsMap[prompt.name] = {
              name: prompt.name,
              description: prompt.description,
              arguments: prompt.arguments || [],
            };
          }
        }
      }

      return promptsMap;
    }, 'Failed to list prompts');
  }

  async prompt(name: string): Promise<PromptDefinition | undefined> {
    const allPrompts = await this.prompts();
    return allPrompts[name];
  }

  async getPrompt(
    name: string,
    args?: Record<string, unknown>,
  ): Promise<PromptMessagesResult> {
    return this.withAuthRetry(async () => {
      const content = await this.universalClient.loadPrompt(name, args);

      // Convert string content to PromptMessagesResult format
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: content,
            },
          },
        ],
      };
    }, `Failed to get prompt "${name}"`);
  }

  async resources(): Promise<
    Record<string, ResourceDefinition | ResourceTemplateDefinition>
  > {
    return this.withAuthRetry(async () => {
      const [resources, templates] = await Promise.all([
        this.universalClient.listResources(),
        this.universalClient.listResourceTemplates(),
      ]);

      const resourcesMap: Record<
        string,
        ResourceDefinition | ResourceTemplateDefinition
      > = {};

      // Add static resources
      if (Array.isArray(resources)) {
        for (const resource of resources) {
          if (resource?.uri) {
            resourcesMap[resource.uri] = {
              uri: resource.uri,
              name: resource.name,
              mimeType: resource.mimeType,
            };
          }
        }
      }

      // Add resource templates
      if (Array.isArray(templates)) {
        for (const template of templates) {
          if (template?.uriTemplate) {
            resourcesMap[template.uriTemplate] = {
              uriTemplate: template.uriTemplate,
              name: template.name,
              mimeType: template.mimeType,
              arguments: template.arguments || [],
            };
          }
        }
      }

      return resourcesMap;
    }, 'Failed to list resources');
  }

  async readResource<T = unknown>(uri: string): Promise<T> {
    return this.withAuthRetry(async () => {
      const result = await this.universalClient.readResource(uri);
      return result as T;
    }, `Failed to read resource "${uri}"`);
  }

  async readResourceTemplate<T = unknown>(
    uriTemplate: string,
    args: Record<string, unknown>,
  ): Promise<T> {
    return this.withAuthRetry(async () => {
      const result = await this.universalClient.readResource({
        uri: uriTemplate,
        ...args,
      });
      return result as T;
    }, `Failed to read resource template "${uriTemplate}"`);
  }

  async close(): Promise<void> {
    let closeError: unknown;
    try {
      await this.universalClient.close();
    } catch (error) {
      closeError = error;
    }

    if (typeof this.transport?.close === 'function') {
      try {
        await this.transport.close();
      } catch (transportCloseErr) {
        console.warn('Failed to close MCP transport', transportCloseErr);
      }
    }

    if (this.transport && '_abortController' in this.transport) {
      this.transport._abortController = undefined;
    }

    if (closeError) {
      throw closeError;
    }
  }

  // Additional methods that provide access to Universal client capabilities
  getUniversalClient(): UniversalMcpClient {
    return this.universalClient;
  }

  // Convenience methods for checking server capabilities
  getServerType(): McpServerType {
    return this.universalClient.getServerType();
  }

  supportsPayment(): boolean {
    return this.universalClient.supportsPayment();
  }

  supportsAuth(): boolean {
    return this.universalClient.supportsAuth();
  }

  private async handleError(context: string, error: unknown): Promise<never> {
    const err = error as { [key: string]: any } | undefined;

    console.error(`${context}: ${err?.message ?? 'Unknown error'}`);
    throw new MCPError({
      message: `${context}: ${err?.message ?? 'Unknown error'}`,
      code: err?.code,
      detail: err?.detail || err?.stack,
    });
  }
}

// Lightweight URL-based client cache to prevent immediate reconnection storms
// For application-level client management, use RemoteMCPManager instead
const clientCache = new Map<string, UnifiedMcpClientAdapter>();

/**
 * Creates a unified MCP client that supports both HTTP and PostMessage transports
 * This is the main entry point for creating MCP clients in nuwa-client
 *
 * Note: This function creates a new client instance each time. For application-level
 * client management (e.g., Cap-based MCP servers), use RemoteMCPManager instead.
 * This lightweight caching is only for preventing immediate reconnections in error scenarios.
 */
export async function createUnifiedMcpClient(
  url: string,
  transportType: 'httpStream' | 'postMessage' = 'httpStream',
  postMessageOptions?: {
    targetWindow: Window;
    targetOrigin?: string;
    allowedOrigins?: string[];
    debug?: boolean;
    timeout?: number;
  },
): Promise<UnifiedMcpClientAdapter> {
  // Lightweight caching to prevent immediate reconnections in error scenarios
  const cacheKey = url;

  // Return existing client if available and still connected
  const existingClient = clientCache.get(cacheKey);
  if (existingClient) {
    try {
      // Test if the client is still functional by checking server type
      existingClient.getServerType();
      return existingClient;
    } catch (error) {
      // Client is no longer functional, remove from cache
      clientCache.delete(cacheKey);
      try {
        await existingClient.close();
      } catch (closeError) {
        console.warn('Failed to close stale MCP client:', closeError);
      }
    }
  }

  // Initialize identity kit for DID authentication
  const sdk = await IdentityKitWeb.init({ storage: 'local' });

  let transport: any;

  if (transportType === 'postMessage') {
    if (!postMessageOptions) {
      throw new Error('PostMessage transport requires postMessageOptions');
    }

    // Create PostMessage transport using ui-kit
    transport = new PostMessageMCPTransport({
      targetWindow: postMessageOptions.targetWindow,
      targetOrigin: postMessageOptions.targetOrigin,
      allowedOrigins: postMessageOptions.allowedOrigins,
      debug: postMessageOptions.debug,
      timeout: postMessageOptions.timeout,
    });
  } else {
    const resourceMetadata = await getMCPAuthResourceMetadata(url);
    transport = new StreamableHTTPClientTransport(new URL(url), {
      authProvider: new StreamableHTTPTransportOAuthProvider({
        mcpUrl: url,
        resourceMetadata,
      }),
    });
  }

  // Create universal client with custom transport if provided
  const universalClient = await createMcpClient({
    baseUrl: url,
    env: sdk.getIdentityEnv(),
    maxAmount: BigInt(0), // Default max amount, can be overridden
    debug: true,
    customTransport: transport,
  });

  const clientAdapter = new UnifiedMcpClientAdapter(universalClient, transport);

  // Cache the client for immediate reuse (prevents reconnection storms)
  clientCache.set(cacheKey, clientAdapter);

  return clientAdapter;
}

/**
 * Close and remove a cached client instance.
 * This function properly closes the client connection and removes it from cache
 * to prevent resource leaks.
 */
export async function closeUnifiedMcpClient(url: string): Promise<void> {
  const client = clientCache.get(url);
  if (client) {
    try {
      await client.close();
    } catch (error) {
      console.warn(`Failed to close MCP client for ${url}:`, error);
    } finally {
      // Always remove from cache, even if close failed
      clientCache.delete(url);
    }
  }
}

/**
 * Close all cached client instances.
 * Useful for application shutdown or cleanup.
 */
export async function closeAllUnifiedMcpClients(): Promise<void> {
  const closePromises: Promise<void>[] = [];

  for (const [cacheKey, client] of clientCache.entries()) {
    closePromises.push(
      client.close().catch((error) => {
        console.warn(`Failed to close MCP client ${cacheKey}:`, error);
      }),
    );
  }

  // Wait for all clients to close
  await Promise.allSettled(closePromises);

  // Clear the cache
  clientCache.clear();
}

/**
 * Get the number of cached clients (for debugging/monitoring)
 */
export function getCachedClientCount(): number {
  return clientCache.size;
}
