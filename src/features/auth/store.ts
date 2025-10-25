// account-store.ts
// 依赖: viem, @simplewebauthn/browser, zustand, dexie

import {
  startAuthentication,
  startRegistration,
} from '@simplewebauthn/browser';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/types';
import type { Hex, SignableMessage, TransactionSerializable } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AUTH_CONFIG } from '../../shared/config/auth';
import { createAccountStatePersistConfig } from '../../shared/storage/indexeddb-config';
import { SessionManager } from './service/session';
import type {
  AccountData,
  AuthMethodConfig,
  AuthRequestCallback,
  ManagedAccount,
} from './types';
import {
  bufferToBase64,
  decryptPrivateKey,
  decryptWithSessionKey,
  deriveKeyFromCredential,
  encryptPrivateKey,
  encryptWithSessionKey,
} from './utils/crypto';

// 全局常量
export const IS_PASSKEY_SUPPORTED =
  window?.PublicKeyCredential && window?.navigator?.credentials;

// ==================== 数据库 ====================
// 现在使用 IndexedDB 通过 persist 中间件自动管理

const sessionManager = new SessionManager();

// 临时私钥存储（使用 sessionKey 加密）
const tempEncryptedPrivateKey = new Map<string, string>();

// ==================== Zustand Store ====================

export interface AccountStoreState {
  // 状态
  accounts: AccountData[];
  account: ManagedAccount | null; // 当前账户

  // 授权回调（由 UI 层设置）
  authRequestCallback: AuthRequestCallback | null;
  setAuthRequestCallback: (callback: AuthRequestCallback | null) => void;

  // 账户管理
  createAccount: (name: string, pin: string) => Promise<ManagedAccount>;
  deleteAccount: (address: string) => Promise<void>;
  renameAccount: (address: string, newName: string) => Promise<void>;
  getAccount: (address: string) => AccountData | undefined;
  switchAccount: (address: string) => void;

  // 认证方式管理（只操作当前账户）
  addPasskeyAuth: () => Promise<void>;
  removePasskeyAuth: () => Promise<void>;
  changePinAuth: (oldPin: string, newPin: string) => Promise<void>;

  // Session 配置（只操作当前账户）
  setSessionDuration: (duration: number) => void;
  getSessionRemainingTime: () => number;

  // 内部方法
  _getPrivateKey: (forceAuth?: boolean) => Promise<Hex>;
  _authenticateWithPin: (pin: string) => Promise<Hex>;
  _authenticateWithPasskey: () => Promise<Hex>;
  _createSession: (sessionKey: string) => void;
  _clearSession: () => void;
  _isSessionActive: () => boolean;
  _unlockPrivateKeyWithSessionKey: (sessionKey: string) => Promise<Hex>;
}

export const AccountStore = create<AccountStoreState>()(
  persist(
    (set, get) => ({
      // 初始状态
      accounts: [],
      account: null,
      authRequestCallback: null,

      // ==================== 设置授权回调 ====================

      setAuthRequestCallback: (callback) => {
        set({ authRequestCallback: callback });
      },

      // ==================== 账户管理 ====================

      createAccount: async (name, pin) => {
        if (!pin) {
          throw new Error('创建账户必须提供 PIN 码');
        }

        if (pin.length < 6) {
          throw new Error('PIN 码至少需要 6 位');
        }

        // 生成私钥
        const privateKey = generatePrivateKey();
        const tempAccount = privateKeyToAccount(privateKey);

        const authMethods: AuthMethodConfig = {};

        // 添加 PIN 认证（必须）
        authMethods.pin = await encryptPrivateKey(
          privateKey,
          pin,
          AUTH_CONFIG.pbkdf2Iterations,
        );

        const account: AccountData = {
          address: tempAccount.address, // 使用 address 作为主键
          name,
          authMethods,
          sessionDuration: AUTH_CONFIG.defaultSessionDuration,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        // 数据会通过 persist 中间件自动同步到 IndexedDB

        // 生成 sessionKey 并创建初始 session（因为用户刚输入过认证信息）
        const sessionKey = crypto
          .getRandomValues(new Uint8Array(32))
          .toString();
        const encryptedPrivateKey = await encryptWithSessionKey(
          privateKey,
          sessionKey,
        );
        tempEncryptedPrivateKey.set(tempAccount.address, encryptedPrivateKey);
        sessionManager.createSession(
          tempAccount.address,
          sessionKey,
          account.sessionDuration,
        );

        // 创建 ManagedAccount
        const managedAccount: ManagedAccount = {
          address: tempAccount.address as Hex,
          type: 'local',
          source: 'custom',
          publicKey: '0x' as Hex,
          isLocked: () => !get()._isSessionActive(),
          signMessage: async ({ message }: { message: SignableMessage }) => {
            const privateKey = await get()._getPrivateKey();
            const account = privateKeyToAccount(privateKey);
            return account.signMessage({ message });
          },
          signTransaction: async (transaction: TransactionSerializable) => {
            const privateKey = await get()._getPrivateKey();
            const account = privateKeyToAccount(privateKey);
            return account.signTransaction(transaction);
          },
          signTypedData: async (parameters: any) => {
            const privateKey = await get()._getPrivateKey();
            const account = privateKeyToAccount(privateKey);
            return account.signTypedData(parameters);
          },
          DANGEROUS_exportPrivateKey: async () => {
            return await get()._getPrivateKey(true);
          },
        };

        set((state) => ({
          accounts: [...state.accounts, account],
          account: managedAccount,
        }));

        return managedAccount;
      },

      deleteAccount: async (address) => {
        sessionManager.clearSession(address);
        tempEncryptedPrivateKey.delete(address);

        set((state) => {
          const newAccounts = state.accounts.filter(
            (a) => a.address !== address,
          );
          const newAccount =
            state.account?.address === address ? null : state.account;

          return {
            accounts: newAccounts,
            account: newAccount,
          };
        });
      },

      renameAccount: async (address, newName) => {
        const account = get().accounts.find((a) => a.address === address);
        if (!account) throw new Error('账户不存在');

        const updatedAccount = {
          ...account,
          name: newName,
          updatedAt: Date.now(),
        };

        // 数据会通过 persist 中间件自动同步到 IndexedDB

        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.address === address ? updatedAccount : a,
          ),
        }));
      },

      getAccount: (address) => {
        return get().accounts.find((a) => a.address === address);
      },

      // ==================== 账户切换 ====================

      switchAccount: (address) => {
        const accountData = get().accounts.find((a) => a.address === address);
        if (!accountData) throw new Error('账户不存在');

        const { _getPrivateKey } = get();

        // 创建 ManagedAccount
        const managedAccount: ManagedAccount = {
          address: accountData.address as Hex,
          type: 'local',
          source: 'custom',
          publicKey: '0x' as Hex,
          isLocked: () => !get()._isSessionActive(),
          signMessage: async ({ message }: { message: SignableMessage }) => {
            const privateKey = await _getPrivateKey();
            const account = privateKeyToAccount(privateKey);
            return account.signMessage({ message });
          },
          signTransaction: async (transaction: TransactionSerializable) => {
            const privateKey = await _getPrivateKey();
            const account = privateKeyToAccount(privateKey);
            return account.signTransaction(transaction);
          },
          signTypedData: async (parameters: any) => {
            const privateKey = await _getPrivateKey();
            const account = privateKeyToAccount(privateKey);
            return account.signTypedData(parameters);
          },
          DANGEROUS_exportPrivateKey: async () => {
            return await _getPrivateKey(true);
          },
        };

        set({ account: managedAccount });
      },

      // ==================== 认证方式管理 ====================

      addPasskeyAuth: async () => {
        const { _getPrivateKey, account } = get();

        if (!account) {
          throw new Error('没有当前账户');
        }

        if (!IS_PASSKEY_SUPPORTED) {
          throw new Error('当前浏览器不支持 Passkey');
        }

        const accountData = get().accounts.find(
          (a) => a.address === account.address,
        );
        if (!accountData) throw new Error('当前账户不存在');

        // 需要先获取私钥（可能需要授权）
        const privateKey = await _getPrivateKey(true);

        const challenge = crypto.getRandomValues(new Uint8Array(32));
        // 使用账户地址作为用户标识
        const userIdBytes = new TextEncoder().encode(accountData.address);

        const registrationOptions: PublicKeyCredentialCreationOptionsJSON = {
          challenge: bufferToBase64(challenge),
          rp: {
            name: AUTH_CONFIG.appName,
            id: window.location.hostname,
          },
          user: {
            id: bufferToBase64(userIdBytes),
            name: accountData.address,
            displayName: accountData.name,
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },
            { alg: -257, type: 'public-key' },
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'required',
          },
          timeout: 60000,
        };

        const credential = await startRegistration({
          optionsJSON: registrationOptions,
        });
        const derivedKey = await deriveKeyFromCredential(credential.id);
        const encrypted = await encryptPrivateKey(
          privateKey,
          derivedKey,
          AUTH_CONFIG.pbkdf2Iterations,
        );

        const updatedAccount = {
          ...accountData,
          authMethods: {
            ...accountData.authMethods,
            passkey: {
              ...encrypted,
              credentialId: credential.id,
            },
          },
          updatedAt: Date.now(),
        };

        // 数据会通过 persist 中间件自动同步到 IndexedDB

        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.address === account.address ? updatedAccount : a,
          ),
        }));
      },

      removePasskeyAuth: async () => {
        const { account } = get();

        if (!account) {
          throw new Error('没有当前账户');
        }

        const accountData = get().accounts.find(
          (a) => a.address === account.address,
        );
        if (!accountData) throw new Error('当前账户不存在');
        if (!accountData.authMethods.passkey) {
          throw new Error('此账户未启用 Passkey 认证');
        }

        const updatedAccount = {
          ...accountData,
          authMethods: {
            ...accountData.authMethods,
            passkey: undefined,
          },
          updatedAt: Date.now(),
        };

        // 数据会通过 persist 中间件自动同步到 IndexedDB

        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.address === account.address ? updatedAccount : a,
          ),
        }));
      },

      changePinAuth: async (oldPin, newPin) => {
        const { account } = get();

        if (!account) {
          throw new Error('没有当前账户');
        }

        const accountData = get().accounts.find(
          (a) => a.address === account.address,
        );
        if (!accountData) throw new Error('当前账户不存在');
        if (!accountData.authMethods.pin) throw new Error('未设置 PIN 码认证');

        // 用旧 PIN 解密验证
        const privateKey = await decryptPrivateKey(
          accountData.authMethods.pin,
          oldPin,
          AUTH_CONFIG.pbkdf2Iterations,
        );

        // 用新 PIN 重新加密
        const encrypted = await encryptPrivateKey(
          privateKey,
          newPin,
          AUTH_CONFIG.pbkdf2Iterations,
        );

        const updatedAccount = {
          ...accountData,
          authMethods: {
            ...accountData.authMethods,
            pin: encrypted,
          },
          updatedAt: Date.now(),
        };

        // 数据会通过 persist 中间件自动同步到 IndexedDB

        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.address === account.address ? updatedAccount : a,
          ),
        }));
      },

      // ==================== Session 配置 ====================

      setSessionDuration: (duration) => {
        const { account } = get();
        if (!account) {
          throw new Error('没有当前账户');
        }

        const accountData = get().accounts.find(
          (a) => a.address === account.address,
        );
        if (!accountData) throw new Error('当前账户不存在');

        const updatedAccount = {
          ...accountData,
          sessionDuration: duration,
          updatedAt: Date.now(),
        };

        // 数据会通过 persist 中间件自动同步到 IndexedDB

        // 更新 store
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.address === account.address ? updatedAccount : a,
          ),
        }));
      },

      getSessionRemainingTime: () => {
        const { account } = get();
        if (!account) return 0;
        return sessionManager.getSessionRemainingTime(account.address);
      },

      // ==================== 内部方法 ====================

      // 核心：获取私钥（自动处理 session 和授权）
      _getPrivateKey: async (forceAuth = false) => {
        const { account } = get();

        if (!account) {
          throw new Error('没有当前账户');
        }

        // 如果不是强制授权，先检查 session
        if (!forceAuth) {
          const sessionKey = sessionManager.getSessionKey(account.address);
          if (sessionKey) {
            // 使用 sessionKey 解锁私钥
            return await get()._unlockPrivateKeyWithSessionKey(sessionKey);
          }
        }

        // 需要授权，优先尝试 passkey，失败时回退到 PIN 码
        const accountData = get().accounts.find(
          (a) => a.address === account.address,
        );
        if (!accountData) throw new Error('当前账户不存在');

        let privateKey: Hex;

        // 如果有 passkey 认证，优先尝试
        if (accountData.authMethods.passkey) {
          try {
            privateKey = await get()._authenticateWithPasskey();
          } catch (passkeyError) {
            // Passkey 失败，回退到 PIN 码
            const { authRequestCallback, _authenticateWithPin } = get();

            if (!authRequestCallback) {
              throw new Error('未设置授权回调，无法进行授权');
            }

            const reason = forceAuth
              ? 'export_private_key'
              : 'sign_transaction';
            const authResult = await authRequestCallback(
              account.address,
              reason,
              true,
            ); // 传入 fallback 标志

            if (authResult.method !== 'pin' || !authResult.pin) {
              throw new Error('PIN 码不能为空');
            }
            privateKey = await _authenticateWithPin(authResult.pin);
          }
        } else {
          // 没有 passkey，直接使用 PIN 码
          const { authRequestCallback, _authenticateWithPin } = get();

          if (!authRequestCallback) {
            throw new Error('未设置授权回调，无法进行授权');
          }

          const reason = forceAuth ? 'export_private_key' : 'sign_transaction';
          const authResult = await authRequestCallback(account.address, reason);

          if (authResult.method !== 'pin' || !authResult.pin) {
            throw new Error('PIN 码不能为空');
          }
          privateKey = await _authenticateWithPin(authResult.pin);
        }

        // 如果不是导出私钥操作，创建 session 并存储加密的私钥
        if (!forceAuth) {
          const sessionKey = crypto
            .getRandomValues(new Uint8Array(32))
            .toString();
          const encryptedPrivateKey = await encryptWithSessionKey(
            privateKey,
            sessionKey,
          );
          tempEncryptedPrivateKey.set(account.address, encryptedPrivateKey);
          get()._createSession(sessionKey);
        }

        return privateKey;
      },

      _authenticateWithPin: async (pin) => {
        const { account } = get();

        if (!account) {
          throw new Error('没有当前账户');
        }

        const accountData = get().accounts.find(
          (a) => a.address === account.address,
        );
        if (!accountData) throw new Error('当前账户不存在');
        if (!accountData.authMethods.pin)
          throw new Error('此账户未启用 PIN 码认证');

        const privateKey = await decryptPrivateKey(
          accountData.authMethods.pin,
          pin,
          AUTH_CONFIG.pbkdf2Iterations,
        );

        return privateKey as Hex;
      },

      _authenticateWithPasskey: async () => {
        const { account } = get();

        if (!account) {
          throw new Error('没有当前账户');
        }

        const accountData = get().accounts.find(
          (a) => a.address === account.address,
        );
        if (!accountData) throw new Error('当前账户不存在');
        if (!accountData.authMethods.passkey)
          throw new Error('此账户未启用 Passkey 认证');

        const challenge = crypto.getRandomValues(new Uint8Array(32));

        const authOptions: PublicKeyCredentialRequestOptionsJSON = {
          challenge: bufferToBase64(challenge),
          rpId: window.location.hostname,
          userVerification: 'required',
          timeout: 60000,
          allowCredentials: [
            {
              id: accountData.authMethods.passkey.credentialId,
              type: 'public-key',
            },
          ],
        };

        const authentication = await startAuthentication({
          optionsJSON: authOptions,
        });
        const derivedKey = await deriveKeyFromCredential(authentication.id);
        const privateKey = await decryptPrivateKey(
          accountData.authMethods.passkey,
          derivedKey,
          AUTH_CONFIG.pbkdf2Iterations,
        );

        return privateKey as Hex;
      },

      // ==================== 内部 Session 管理 ====================

      _createSession: (sessionKey) => {
        const { account } = get();
        if (account) {
          const accountData = get().accounts.find(
            (a) => a.address === account.address,
          );
          if (accountData) {
            sessionManager.createSession(
              account.address,
              sessionKey,
              accountData.sessionDuration,
            );
          }
        }
      },

      _clearSession: () => {
        const { account } = get();
        if (account) {
          sessionManager.clearSession(account.address);
          tempEncryptedPrivateKey.delete(account.address);
        }
      },

      _isSessionActive: () => {
        const { account } = get();
        if (!account) return false;
        return sessionManager.isSessionActive(account.address);
      },

      _unlockPrivateKeyWithSessionKey: async (sessionKey) => {
        const { account } = get();
        if (!account) {
          throw new Error('没有当前账户');
        }

        const encryptedPrivateKey = tempEncryptedPrivateKey.get(
          account.address,
        );
        if (!encryptedPrivateKey) {
          throw new Error('Session 已过期，需要重新认证');
        }

        try {
          const privateKey = await decryptWithSessionKey(
            encryptedPrivateKey,
            sessionKey,
          );
          return privateKey as Hex;
        } catch (error) {
          throw new Error('Session 已过期，需要重新认证');
        }
      },
    }),
    createAccountStatePersistConfig({
      name: 'account-store',
      partialize: (state) => ({
        accounts: state.accounts,
        account: state.account, // 现在也持久化当前账户
        // 不持久化 authRequestCallback 等运行时状态
      }),
    }),
  ),
);
