import type { OAuth2Client, OAuth2Token } from '@badgateway/oauth2-client';
import type { Locale } from '@/shared/locales';

export type UserSettings = {
  language: Locale;
  name: string;
  avatar: string | null;
  devMode: boolean;
};

export type UserMCPOAuth = Record<
  string, // using the mcpUrl as the key
  UserMCPOAuthPayload
>;

export type UserMCPOAuthPayload = {
  mcpUrl: string;
  resource: string;
  resourceName: string;
  token: OAuth2Token;
  client: OAuth2Client;
};
