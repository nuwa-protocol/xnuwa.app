import type { OAuth2Token } from '@badgateway/oauth2-client';
import type { Locale } from '@/shared/locales';

export type UserSettings = {
  language: Locale;
  name: string;
  avatar: string | null;
  devMode: boolean;
};

export type UserMCPOAuth = Record<
  string,
  {
    resourceName: string;
    updatedAt: number;
    token: OAuth2Token;
  }
>;

export type UserMCPOAuthPayload = {
  resource: string;
  resourceName: string;
  token: OAuth2Token;
};
