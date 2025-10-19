import type { OAuthTokens } from '@modelcontextprotocol/sdk/shared/auth.js';
import { generateUUID } from '../utils/generate-uuid';

export type McpOAuthEventType =
  | 'mcp-oauth:start'
  | 'mcp-oauth:complete'
  | 'mcp-oauth:error';

export const MCP_OAUTH_POPUP_REQUEST_EVENT = 'mcp-oauth:popup-request';

export interface McpOAuthEventDetail {
  url: string;
  resource: string;
  resourceName: string;
  token?: OAuthTokens;
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

export const dispatchMcpOAuthEvent = (
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
