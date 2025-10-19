import type { OAuthTokens } from '@modelcontextprotocol/sdk/shared/auth.js';
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
  tokens: OAuthTokens;
};
