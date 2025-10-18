import { generateCodeVerifier, OAuth2Client } from '@badgateway/oauth2-client';

const RESOURCE_METADATA_URL = '/.well-known/oauth-protected-resource';
const AUTH_SERVER_METADATA_URL = '/.well-known/oauth-authorization-server';
const CLIENT_ID = 'nuwa-client';
const CALLBACK_URL = '/oauth-callback';

export const handleMCPOauth = async (url: string) => {
  const baseUrl = new URL(url).origin;
  const authUrl = await getOAuthURL(baseUrl);
  window.open(authUrl, '_blank');
};

const getOAuthURL = async (baseUrl: string) => {
  const redirectUri = `${window.location.origin}${CALLBACK_URL}`;

  const resourceMetadata = await getResourceMetadata(baseUrl);
  const authServerMetadata = await getAuthServerMetadata(baseUrl);

  const client = new OAuth2Client({
    server: baseUrl,
    clientId: CLIENT_ID,
    tokenEndpoint: authServerMetadata.token_endpoint,
    authorizationEndpoint: authServerMetadata.authorization_endpoint,
  });

  const codeVerifier = await generateCodeVerifier();
  const authUrl = await client.authorizationCode.getAuthorizeUri({
    redirectUri: redirectUri,
    codeVerifier,
  });

  return authUrl;
};

const getResourceMetadata = async (baseUrl: string) => {
  const response = await fetch(`${baseUrl}${RESOURCE_METADATA_URL}`);
  const metadata = await response.json();
  return metadata;
};

const getAuthServerMetadata = async (baseUrl: string) => {
  const response = await fetch(`${baseUrl}${AUTH_SERVER_METADATA_URL}`);
  const metadata = await response.json();
  return metadata;
};
