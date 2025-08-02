import type { LanguageModelV1 } from '@ai-sdk/provider';
import { createNuwaMCPClient } from '@/shared/services/mcp-client';
import type { CurrentCap } from '@/shared/stores/current-cap-store';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import { llmProvider } from './providers';

export class CapResolve {
  private cap: CurrentCap;
  private mcpClients: Map<string, any> = new Map();

  constructor(cap?: CurrentCap) {
    if (cap) {
      this.cap = cap;
    } else {
      const { currentCap } = CurrentCapStore.getState();
      if (!currentCap) {
        throw new Error('No cap selected. Please select a cap to use.');
      }
      this.cap = currentCap;
    }
  }

  async init(): Promise<void> {
    const mcpServers = this.cap.mcpServers || {};

    for (const [serverName, serverConfig] of Object.entries(mcpServers)) {
      try {
        const client = await createNuwaMCPClient(
          serverConfig.url,
          serverConfig.transport,
        );
        this.mcpClients.set(serverName, client);
      } catch (error) {
        console.warn(
          `Failed to connect to MCP server ${serverName} at ${serverConfig.url}:`,
          error,
        );
      }
    }
  }

  private async getUserLocation(): Promise<string> {
    try {
      // Try to get user location using browser geolocation API
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
          }
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            enableHighAccuracy: false,
          });
        },
      );

      // Use reverse geocoding or return coordinates
      const { latitude, longitude } = position.coords;
      return `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
    } catch {
      // Fallback to browser language/timezone based location
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return timezone.split('/').pop() || 'Unknown';
    }
  }

  private getCurrentDateTime(): string {
    return new Date().toLocaleString();
  }

  private async resolveVariables(prompt: string): Promise<string> {
    let resolvedPrompt = prompt;

    // Resolve {{date}} variable
    if (resolvedPrompt.includes('{{date}}')) {
      const currentDate = this.getCurrentDateTime();
      resolvedPrompt = resolvedPrompt.replace(/\{\{date\}\}/g, currentDate);
    }

    // Resolve {{user_geo}} variable
    if (resolvedPrompt.includes('{{user_geo}}')) {
      const userLocation = await this.getUserLocation();
      resolvedPrompt = resolvedPrompt.replace(
        /\{\{user_geo\}\}/g,
        userLocation,
      );
    }

    return resolvedPrompt;
  }

  async getResolvedPrompt(): Promise<string> {
    return await this.resolveVariables(this.cap.prompt);
  }

  getResolvedModel(): LanguageModelV1 {
    return llmProvider.chat(this.cap.model.id);
  }

  async tools(): Promise<Record<string, any>> {
    const allTools: Record<string, any> = {};

    // Iterate through all MCP clients
    for (const [serverName, client] of this.mcpClients.entries()) {
      try {
        // Fetch tools from this server
        const serverTools = await client.tools();

        // Merge tools into the combined tools object
        // Prefix tool names with server name to avoid conflicts
        for (const [toolName, toolDefinition] of Object.entries(serverTools)) {
          const prefixedToolName = `${serverName}_${toolName}`;
          allTools[prefixedToolName] = {
            ...(toolDefinition as Record<string, any>),
            _serverName: serverName,
            _originalName: toolName,
          };
        }
      } catch (error) {
        console.warn(
          `Failed to get tools from MCP server ${serverName}:`,
          error,
        );
        // Continue with other servers even if one fails
      }
    }

    return allTools;
  }

  async close(): Promise<void> {
    for (const [serverName, client] of this.mcpClients.entries()) {
      try {
        await client.close();
      } catch (error) {
        console.warn(`Failed to close MCP client ${serverName}:`, error);
      }
    }
    this.mcpClients.clear();
  }

  async getResolvedConfig() {
    return {
      prompt: await this.getResolvedPrompt(),
      model: this.getResolvedModel(),
      mcp: {
        init: () => this.init(),
        tools: () => this.tools(),
        close: () => this.close(),
      },
    };
  }
}
