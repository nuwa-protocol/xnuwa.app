import { generateCodeVerifier, OAuth2Client } from '@badgateway/oauth2-client';
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

export const handleMCPOauth = async (url: string): Promise<void> => {
  const baseUrl = new URL(url).origin;

  const resourceMetadata = await getResourceMetadata(baseUrl);
  const authServerMetadata = await getAuthServerMetadata(baseUrl);
  const { client_id: clientId, client_secret: clientSecret } =
    await registerClient(authServerMetadata.registration_endpoint);

  const resource = resourceMetadata.resource;
  if (!resource) {
    throw new Error('Missing resource identifier in metadata');
  }

  const resourceName =
    resourceMetadata.resource_name ?? resourceMetadata.resourceName ?? resource;

  const { userMCPOAuths } = SettingsStateStore.getState();
  const existingOAuth = userMCPOAuths[resource];

  if (existingOAuth?.token) {
    // TODO: return the existing token for the request
    return;
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

  const authUrl = await client.authorizationCode.getAuthorizeUri({
    redirectUri: MCP_OAUTH_CALLBACK_URL,
    codeVerifier,
    state,
  });

  window.open(authUrl, '_blank');
  window.addEventListener(
    'message',
    handleCallback(resource, resourceName, client, state, codeVerifier),
  );
};

const handleCallback =
  (
    resource: string,
    resourceName: string,
    client: OAuth2Client,
    state: string,
    codeVerifier: string,
  ) =>
  async (event: MessageEvent) => {
    // Check if the message is from the same origin
    if (event.origin !== MCP_OAUTH_ORIGIN) return;

    // Check if the message is a valid MCP OAuth callback
    if (event.data.type !== 'mcp-oauth') return;

    // Get the token from the message
    const code = event.data.code;
    const state = event.data.state;

    const token = await client.authorizationCode.getToken({
      code,
      state,
      redirectUri: MCP_OAUTH_CALLBACK_URL,
      codeVerifier,
    });

    const { upsertUserMCPOAuth } = SettingsStateStore.getState();

    upsertUserMCPOAuth({
      resource,
      resourceName,
      token: token,
    });

    console.log('token', token);
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
