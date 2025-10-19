import type { OAuthClientProvider } from '@modelcontextprotocol/sdk/client/auth.js';
import type {
  OAuthClientInformation,
  OAuthClientInformationFull,
  OAuthClientMetadata,
  OAuthTokens,
} from '@modelcontextprotocol/sdk/shared/auth.js';
import { SettingsStateStore } from '@/features/settings/stores';
import {
  MCP_OAUTH_CALLBACK_URL,
  MCP_OAUTH_ORIGIN,
} from '@/shared/config/mcp-oauth';
import {
  dispatchMcpOAuthEvent,
  onMcpOAuthEvent,
  requestMcpOAuthPopup,
} from './mcp-oauth-event';

const RESOURCE_METADATA_URL = '/.well-known/oauth-protected-resource';

export interface ResourceMetadata {
  resource: string;
  resource_name: string;
  resourceName: string;
}

export class StreamableHTTPTransportOAuthProvider
  implements OAuthClientProvider
{
  private _clientInformation?: OAuthClientInformationFull;
  private _codeVerifier?: string;
  private _tokens?: OAuthTokens;
  private _mcpUrl: string;
  private _resourceMetadata?: ResourceMetadata;
  private _popup?: Window | null;
  private _popupMonitor?: number;
  private _awaitingCallback = false;

  private _onRedirect = async (url: URL) => {
    try {
      this._popup = await requestMcpOAuthPopup({
        url: this._mcpUrl,
        resource: this._resourceMetadata?.resource ?? '',
        resourceName: this._resourceMetadata?.resource_name ?? '',
        authUrl: url.toString(),
      });
    } catch (error) {
      this._awaitingCallback = false;
      this.stopPopupMonitor();
      throw error;
    }

    if (!this._popup) {
      const error = new Error('Failed to open OAuth window');
      dispatchMcpOAuthEvent('mcp-oauth:error', {
        url: this._mcpUrl,
        resource: this._resourceMetadata?.resource ?? '',
        resourceName: this._resourceMetadata?.resource_name ?? '',
        error,
      });
      throw error;
    }

    this._awaitingCallback = true;
    this.startPopupMonitor();
  };

  constructor({
    mcpUrl,
    resourceMetadata,
  }: { mcpUrl: string; resourceMetadata: ResourceMetadata | undefined }) {
    this._mcpUrl = mcpUrl;
    this._resourceMetadata = resourceMetadata;
  }

  get redirectUrl(): string | URL {
    return MCP_OAUTH_CALLBACK_URL;
  }

  get clientMetadata(): OAuthClientMetadata {
    const clientMetadata: OAuthClientMetadata = {
      client_name: 'Simple OAuth MCP Client',
      redirect_uris: [MCP_OAUTH_CALLBACK_URL],
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      token_endpoint_auth_method: 'client_secret_post',
      scope: 'mcp:tools',
    };
    return clientMetadata;
  }

  clientInformation(): OAuthClientInformation | undefined {
    return this._clientInformation;
  }

  saveClientInformation(clientInformation: OAuthClientInformationFull): void {
    console.debug('[MCP OAuth]saving client information', clientInformation);
    this._clientInformation = clientInformation;
  }

  tokens(): OAuthTokens | undefined {
    if (!this._tokens) {
      this._tokens =
        SettingsStateStore.getState().userMCPOAuths[this._mcpUrl]?.tokens;
      console.debug('[MCP OAuth] Getting saved tokens', this._tokens);
    }
    return this._tokens;
  }

  saveTokens(tokens: OAuthTokens): void {
    console.debug('[MCP OAuth] Saving tokens', tokens);
    SettingsStateStore.getState().upsertUserMCPOAuth({
      mcpUrl: this._mcpUrl,
      tokens,
    });
    this._tokens = tokens;
    this._awaitingCallback = false;
    this.stopPopupMonitor();
    try {
      this._popup?.close();
    } catch (error) {
      console.warn('Failed to close OAuth popup after token save', error);
    }
    this._popup = null;
  }

  redirectToAuthorization(authorizationUrl: URL): void {
    this._onRedirect(authorizationUrl);
  }

  saveCodeVerifier(codeVerifier: string): void {
    this._codeVerifier = codeVerifier;
  }

  codeVerifier(): string {
    if (!this._codeVerifier) {
      throw new Error('No code verifier saved');
    }
    return this._codeVerifier;
  }

  private startPopupMonitor(): void {
    if (typeof window === 'undefined') {
      return;
    }
    this.stopPopupMonitor();
    this._popupMonitor = window.setInterval(() => {
      if (!this._popup || this._popup.closed) {
        this.stopPopupMonitor();
        if (this._awaitingCallback) {
          const error = new Error('OAuth window closed before completion');
          dispatchMcpOAuthEvent('mcp-oauth:error', {
            url: this._mcpUrl,
            resource: this._resourceMetadata?.resource ?? '',
            resourceName: this._resourceMetadata?.resource_name ?? '',
            error,
          });
        }
        this._awaitingCallback = false;
        this._popup = null;
      }
    }, 500);
  }

  private stopPopupMonitor(): void {
    if (typeof window === 'undefined') {
      return;
    }
    if (this._popupMonitor !== undefined) {
      window.clearInterval(this._popupMonitor);
      this._popupMonitor = undefined;
    }
  }
}

export const getMCPAuthResourceMetadata = async (
  mcpUrl: string,
): Promise<ResourceMetadata | undefined> => {
  try {
    const baseUrl = new URL(mcpUrl).origin;
    const response = await fetch(`${baseUrl}${RESOURCE_METADATA_URL}`);
    const metadata = await response.json();
    return metadata;
  } catch (error) {
    return undefined;
  }
};

export const handleUahtorized = async () => {
  // need to handle the callback here and also handle the transport finishAuth
  return await waitForOAuthCallback();
};

function waitForOAuthCallback() {
  return new Promise<string>((resolve, reject) => {
    const cleanup = () => {
      window.removeEventListener('message', handler);
      unsubscribeError();
    };

    const handler = (event: MessageEvent) => {
      if (event.origin !== MCP_OAUTH_ORIGIN) return;
      if (event.data?.type !== 'mcp-oauth') return;
      const code = event.data.code;
      if (!code) return;
      cleanup();
      resolve(code);
    };

    const unsubscribeError = onMcpOAuthEvent('mcp-oauth:error', (detail) => {
      cleanup();
      const error =
        detail.error instanceof Error
          ? detail.error
          : new Error(
              detail.error
                ? String(detail.error)
                : 'OAuth authorization failed',
            );
      reject(error);
    });

    window.addEventListener('message', handler);
  });
}
