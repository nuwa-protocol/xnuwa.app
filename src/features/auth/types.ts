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
  address: string; // 以太坊地址（作为唯一标识）
  name: string;
  authMethods: AuthMethodConfig;
  sessionDuration: number; // 账户级别的 session 持续时间（毫秒）
  createdAt: number;
  updatedAt: number;
}

export interface SessionState {
  address: string; // 使用 address 作为标识
  sessionKey: string; // 用于解锁账户的会话密钥
  expiresAt: number;
}

// 自定义的 Viem Account，签名时会自动处理授权
export interface ManagedAccount extends LocalAccount {
  isLocked: () => boolean;
  DANGEROUS_exportPrivateKey: () => Promise<Hex>; // 危险操作，强制授权
  publicKey: Hex;
}

// 授权回调类型
export type AuthRequestCallback = (
  address: string,
  reason:
    | 'sign_message'
    | 'sign_transaction'
    | 'sign_typed_data'
    | 'export_private_key',
  isFallback?: boolean, // 是否为回退到 PIN 码的情况
) => Promise<{ method: 'pin' | 'passkey'; pin?: string }>;
