import type { Hex, LocalAccount } from 'viem';

// ==================== 类型定义 ====================

export interface EncryptedData {
  encrypted: number[];
  salt: number[];
  iv: number[];
}

export interface PasskeyData extends EncryptedData {
  credentialId: string;
}

export interface AuthMethodConfig {
  pin?: EncryptedData;
  passkey?: PasskeyData;
}

export interface AccountData {
  address: string; // Ethereum address (as unique identifier)
  name: string;
  authMethods: AuthMethodConfig;
  sessionDuration: number; // Account-level session duration (milliseconds)
  createdAt: number;
  updatedAt: number;
}

export interface SessionState {
  address: string; // Use address as identifier
  sessionKey: string; // Session key for unlocking the account
  expiresAt: number;
}

// Custom Viem Account, automatically handles authorization when signing
export interface ManagedAccount extends LocalAccount {
  isLocked: () => boolean;
  DANGEROUS_exportPrivateKey: () => Promise<Hex>; // Dangerous operation, force authorization
  publicKey: Hex;
}

// Authorization callback type
export type AuthRequestCallback = (
  address: string,
  reason:
    | 'sign_message'
    | 'sign_transaction'
    | 'sign_typed_data'
    | 'export_private_key',
  isFallback?: boolean, // Whether to fall back to PIN code
) => Promise<{ method: 'pin' | 'passkey'; pin?: string }>;
