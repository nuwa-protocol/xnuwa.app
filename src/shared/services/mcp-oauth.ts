import {
  generateCodeVerifier,
  OAuth2Client,
  type OAuth2Token,
} from '@badgateway/oauth2-client';
import { SettingsStateStore } from '@/features/settings/stores';
import {
  MCP_OAUTH_CALLBACK_URL,
  MCP_OAUTH_ORIGIN,
} from '@/shared/config/mcp-oauth';
import { generateUUID } from '../utils/generate-uuid';

const RESOURCE_METADATA_URL = '/.well-known/oauth-protected-resource';
const AUTH_SERVER_METADATA_URL = '/.well-known/oauth-authorization-server';

interface ResourceMetadata {
  resource: string;
  resource_name: string;
  resourceName: string;
}

export type McpOAuthEventType =
  | 'mcp-oauth:start'
  | 'mcp-oauth:complete'
  | 'mcp-oauth:error';

export const MCP_OAUTH_POPUP_REQUEST_EVENT = 'mcp-oauth:popup-request';

export interface McpOAuthEventDetail {
  url: string;
  resource: string;
  resourceName: string;
  token?: OAuth2Token;
  error?: unknown;
}

export interface McpOAuthPopupRequestDetail {
  id: string;
  url: string;
  resource: string;
  resourceName: string;
  authUrl: string;
  confirm: (popup: Window | null) => void;
  reject: (error?: Error) => void;
}

type McpOAuthPopupRequestListener = (
  detail: McpOAuthPopupRequestDetail,
) => void;

const mcpOAuthEventTarget = new EventTarget();
const mcpOAuthPopupEventTarget = new EventTarget();

const dispatchMcpOAuthEvent = (
  type: McpOAuthEventType,
  detail: McpOAuthEventDetail,
): void => {
  mcpOAuthEventTarget.dispatchEvent(new CustomEvent(type, { detail }));
};

export const onMcpOAuthEvent = (
  type: McpOAuthEventType,
  listener: (detail: McpOAuthEventDetail) => void,
): (() => void) => {
  const handler = (event: Event) =>
    listener((event as CustomEvent<McpOAuthEventDetail>).detail);
  mcpOAuthEventTarget.addEventListener(type, handler as EventListener);
  return () => {
    mcpOAuthEventTarget.removeEventListener(type, handler as EventListener);
  };
};

export const requestMcpOAuthPopup = ({
  url,
  resource,
  resourceName,
  authUrl,
}: {
  url: string;
  resource: string;
  resourceName: string;
  authUrl: string;
}): Promise<Window | null> => {
  return new Promise((resolve, reject) => {
    let settled = false;

    const finalize = (callback: () => void) => {
      if (settled) {
        return;
      }
      settled = true;
      callback();
    };

    const detail: McpOAuthPopupRequestDetail = {
      id: generateUUID(),
      url,
      resource,
      resourceName,
      authUrl,
      confirm: (popup) => {
        finalize(() => {
          resolve(popup ?? null);
        });
      },
      reject: (error) => {
        finalize(() => {
          reject(error ?? new Error('MCP OAuth flow cancelled by user'));
        });
      },
    };

    mcpOAuthPopupEventTarget.dispatchEvent(
      new CustomEvent<McpOAuthPopupRequestDetail>(
        MCP_OAUTH_POPUP_REQUEST_EVENT,
        {
          detail,
        },
      ),
    );
  });
};

export const onMcpOAuthPopupRequest = (
  listener: McpOAuthPopupRequestListener,
): (() => void) => {
  const handler = (event: Event) =>
    listener((event as CustomEvent<McpOAuthPopupRequestDetail>).detail);

  mcpOAuthPopupEventTarget.addEventListener(
    MCP_OAUTH_POPUP_REQUEST_EVENT,
    handler as EventListener,
  );

  return () => {
    mcpOAuthPopupEventTarget.removeEventListener(
      MCP_OAUTH_POPUP_REQUEST_EVENT,
      handler as EventListener,
    );
  };
};

export const handleMCPOauth = async (url: string): Promise<OAuth2Token> => {
  let resource = '';
  let resourceName = '';
  let flowHandled = false;

  try {
    const baseUrl = new URL(url).origin;

    const resourceMetadata = await getResourceMetadata(baseUrl);
    const authServerMetadata = await getAuthServerMetadata(baseUrl);
    const { client_id: clientId, client_secret: clientSecret } =
      await registerClient(authServerMetadata.registration_endpoint);

    resource = resourceMetadata.resource;
    if (!resource) {
      throw new Error('Missing resource identifier in metadata');
    }

    resourceName =
      resourceMetadata.resource_name ??
      resourceMetadata.resourceName ??
      resource;

    const { userMCPOAuths } = SettingsStateStore.getState();
    const existingOAuth = userMCPOAuths[resource];

    if (existingOAuth?.token) {
      // TODO: Handle re-authentication flow
      // dispatchMcpOAuthEvent('mcp-oauth:complete', {
      //   url,
      //   resource,
      //   resourceName,
      //   token: existingOAuth.token,
      // });
      // return existingOAuth.token;
    }

    const client = new OAuth2Client({
      server: baseUrl,
      clientId,
      clientSecret,
      tokenEndpoint: authServerMetadata.token_endpoint,
      authorizationEndpoint: authServerMetadata.authorization_endpoint,
    });

    const codeVerifier = await generateCodeVerifier();
    const state = generateUUID();

    dispatchMcpOAuthEvent('mcp-oauth:start', {
      url,
      resource,
      resourceName,
    });

    const authUrl = await client.authorizationCode.getAuthorizeUri({
      redirectUri: MCP_OAUTH_CALLBACK_URL,
      codeVerifier,
      state,
    });

    const popup = await requestMcpOAuthPopup({
      url,
      resource,
      resourceName,
      authUrl,
    });

    if (!popup) {
      const error = new Error('Failed to open OAuth window');
      flowHandled = true;
      dispatchMcpOAuthEvent('mcp-oauth:error', {
        url,
        resource,
        resourceName,
        error,
      });
      throw error;
    }

    return await new Promise<OAuth2Token>((resolve, reject) => {
      let closeWatcher: number | undefined;

      function cleanup(): void {
        window.removeEventListener('message', handleMessage);
        if (closeWatcher !== undefined) {
          window.clearInterval(closeWatcher);
          closeWatcher = undefined;
        }
      }

      async function handleMessage(event: MessageEvent): Promise<void> {
        if (event.origin !== MCP_OAUTH_ORIGIN) return;
        if (event.data?.type !== 'mcp-oauth') return;

        const callbackState = event.data.state;
        const code = event.data.code;

        if (!code) {
          return;
        }

        if (callbackState !== state) {
          cleanup();
          flowHandled = true;
          const error = new Error('OAuth state mismatch');
          dispatchMcpOAuthEvent('mcp-oauth:error', {
            url,
            resource,
            resourceName,
            error,
          });
          reject(error);
          return;
        }

        try {
          const token = await client.authorizationCode.getToken({
            code,
            state,
            redirectUri: MCP_OAUTH_CALLBACK_URL,
            codeVerifier,
          });

          SettingsStateStore.getState().upsertUserMCPOAuth({
            resource,
            resourceName,
            token,
          });

          dispatchMcpOAuthEvent('mcp-oauth:complete', {
            url,
            resource,
            resourceName,
            token,
          });

          flowHandled = true;
          cleanup();
          resolve(token);
        } catch (error) {
          cleanup();
          flowHandled = true;
          dispatchMcpOAuthEvent('mcp-oauth:error', {
            url,
            resource,
            resourceName,
            error,
          });
          reject(error);
        }
      }

      window.addEventListener('message', handleMessage);

      closeWatcher = window.setInterval(() => {
        if (popup.closed) {
          cleanup();
          if (!flowHandled) {
            flowHandled = true;
            const error = new Error('OAuth window closed before completion');
            dispatchMcpOAuthEvent('mcp-oauth:error', {
              url,
              resource,
              resourceName,
              error,
            });
            reject(error);
          }
        }
      }, 500);
    });
  } catch (error) {
    if (!flowHandled) {
      dispatchMcpOAuthEvent('mcp-oauth:error', {
        url,
        resource,
        resourceName,
        error,
      });
    }
    throw error;
  }
};

const registerClient = async (registrationEndpoint: string) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: `{
      "redirect_uris": ["${MCP_OAUTH_CALLBACK_URL}"]
    }`,
  };
  const response = await fetch(`${registrationEndpoint}`, options);
  const registration = await response.json();
  return registration;
};

const getResourceMetadata = async (
  baseUrl: string,
): Promise<ResourceMetadata> => {
  const response = await fetch(`${baseUrl}${RESOURCE_METADATA_URL}`);
  const metadata = await response.json();
  return metadata;
};

const getAuthServerMetadata = async (baseUrl: string) => {
  const response = await fetch(`${baseUrl}${AUTH_SERVER_METADATA_URL}`);
  const metadata = await response.json();
  return metadata;
};
