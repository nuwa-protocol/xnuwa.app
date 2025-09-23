import { ChatSessionsStore } from '@/features/chat/stores/chat-sessions-store';
import { RemoteMCPManager } from '@/shared/services/global-mcp-manager';
import type { Cap } from '@/shared/types';

export class CapResolve {
  private cap: Cap;
  private isCurrentCapMCPError: boolean;
  private hasMCPServers: boolean;
  private chatId: string;

  constructor(cap: Cap, chatId: string) {
    this.cap = cap;
    this.isCurrentCapMCPError = false;
    this.hasMCPServers = Object.keys(this.cap.core.mcpServers).length > 0;
    this.chatId = chatId;
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
      return `Latitude: ${latitude}, Longitude: ${longitude}`;
    } catch {
      // Fallback to browser language/timezone based location
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return timezone.split('/').pop() || 'Unknown';
    }
  }

  private getChatSelections(): string[] {
    const chatSelections =
      ChatSessionsStore.getState().chatSessions[this.chatId]?.selections?.map(
        (selection) => selection.message,
      ) || [];
    return chatSelections;
  }

  private async resolveVariables(prompt: string): Promise<string> {
    let resolvedPrompt = prompt;

    // Resolve {{user_geo}} variable
    if (resolvedPrompt.includes('{{user_geo}}')) {
      const userLocation = await this.getUserLocation();
      resolvedPrompt = resolvedPrompt.replace(
        /\{\{user_geo\}\}/g,
        userLocation,
      );
    }

    // Resolve {{artifact_selections}} variable
    if (resolvedPrompt.includes('{{artifact_selections}}')) {
      const chatSelections = this.getChatSelections();

      let promptReplacement = 'No selections from the user';
      if (chatSelections.length > 0) {
        promptReplacement = chatSelections.join('\n');
      }

      resolvedPrompt = resolvedPrompt.replace(
        /\{\{artifact_selections\}\}/g,
        promptReplacement,
      );
    }

    return resolvedPrompt;
  }

  async getResolvedPrompt(): Promise<string> {
    return await this.resolveVariables(this.cap.core.prompt.value);
  }

  async getResolvedTools(): Promise<Record<string, any>> {
    if (this.hasMCPServers && !this.isCurrentCapMCPError) {
      // Make sure MCP is initialized through global manager
      const remoteMCPManager = RemoteMCPManager.getInstance();
      await remoteMCPManager.initializeForCap(this.cap);

      // Get tools from global manager
      return remoteMCPManager.getCurrentTools();
    } else {
      return {};
    }
  }

  async getResolvedConfig() {
    return {
      prompt: await this.getResolvedPrompt(),
      model: this.cap.core.model,
      tools: await this.getResolvedTools(),
    };
  }
}
