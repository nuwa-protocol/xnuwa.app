import { RemoteMCPManager } from '@/shared/services/global-mcp-manager';
import type { Cap } from '@/shared/types';

export class CapResolve {
  private cap: Cap;
  private isCurrentCapMCPError: boolean;
  private hasMCPServers: boolean;

  constructor(cap: Cap) {
    this.cap = cap;
    this.isCurrentCapMCPError = false;
    this.hasMCPServers = Object.keys(this.cap.core.mcpServers).length > 0;
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
