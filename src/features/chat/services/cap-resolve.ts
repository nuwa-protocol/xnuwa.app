import type { LanguageModelV1 } from '@ai-sdk/provider';
import { GlobalMCPManager } from '@/shared/services/global-mcp-manager';
import type { CurrentCap } from '@/shared/stores/current-cap-store';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import { llmProvider } from './providers';

export class CapResolve {
  private cap: CurrentCap;

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
    return await this.resolveVariables(this.cap.prompt.value);
  }

  getResolvedModel(): LanguageModelV1 {
    return llmProvider.chat(this.cap.model.id);
  }

  async getResolvedTools(): Promise<Record<string, any>> {
    // Get tools from global manager
    const mcpManager = GlobalMCPManager.getInstance();
    return mcpManager.getCurrentTools();
  }

  async getResolvedConfig() {
    // Make sure MCP is initialized through global manager
    const mcpManager = GlobalMCPManager.getInstance();
    await mcpManager.initializeForCap(this.cap);

    return {
      prompt: await this.getResolvedPrompt(),
      model: this.getResolvedModel(),
      tools: await this.getResolvedTools(),
    };
  }
}
