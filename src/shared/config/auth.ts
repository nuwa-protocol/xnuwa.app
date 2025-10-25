/**
 * Auth Configuration
 */
export const AUTH_CONFIG = {
  /** Application Name */
  appName: 'Viem Account',

  /** PBKDF2 Iterations, for password encryption */
  pbkdf2Iterations: 100000,

  /** Default Session Duration (milliseconds) */
  defaultSessionDuration: 3600000, // 1 hour
} as const;

export type AuthConfig = typeof AUTH_CONFIG;
