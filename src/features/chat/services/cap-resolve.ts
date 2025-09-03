import { createOpenAI } from '@ai-sdk/openai';
import { LLM_GATEWAY_BASE_URL } from '@/shared/config/llm-gateway';
import { GlobalMCPManager } from '@/shared/services/global-mcp-manager';
import { createPaymentFetch } from '@/shared/services/payment-fetch';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import type { Cap } from '@/shared/types';

export class CapResolve {
  private cap: Cap;
  private isCurrentCapMCPError: boolean;
  private hasMCPServers: boolean;
  private openai: ReturnType<typeof createOpenAI>;

  constructor() {
    const { currentCap, isCurrentCapMCPError } = CurrentCapStore.getState();
    if (!currentCap) {
      throw new Error('No cap selected. Please select a cap to use.');
    }
    this.cap = currentCap;
    this.isCurrentCapMCPError = isCurrentCapMCPError;
    this.hasMCPServers = Object.keys(this.cap.core.mcpServers).length > 0;

    this.openai = createOpenAI({
      apiKey: 'NOT-USED',
      baseURL: LLM_GATEWAY_BASE_URL,
      fetch: createPaymentFetch(LLM_GATEWAY_BASE_URL),
    });
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
      const mcpManager = GlobalMCPManager.getInstance();
      await mcpManager.initializeForCap(this.cap);

      // Get tools from global manager
      return mcpManager.getCurrentTools();
    } else {
      return {};
    }
  }

  async getResolvedConfig() {
    return {
      prompt: await this.getResolvedPrompt(),
      modelId: this.cap.core.model.modelId,
      tools: await this.getResolvedTools(),
    };
  }
}
