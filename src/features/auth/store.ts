import {
  startAuthentication,
  startRegistration,
} from '@simplewebauthn/browser';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/types';
import type { Hash, Hex, SignableMessage, TransactionSerializable } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setAccountAddressResolver } from '@/shared/storage/account-identity';
import { db } from '@/shared/storage/db';
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

// global constants
export const IS_PASSKEY_SUPPORTED: boolean = !!(
  window?.PublicKeyCredential && window?.navigator?.credentials
);

// ==================== Database ====================
// Now using IndexedDB through persist middleware to manage

const sessionManager = new SessionManager();

// Temporary private key storage (encrypted with sessionKey)
const tempEncryptedPrivateKey = new Map<string, string>();

// ==================== Zustand Store ====================

export interface AccountStoreState {
  // State
  accounts: AccountData[];
  account: ManagedAccount | null; // Current account

  // Authorization callback (set by UI layer)
  authRequestCallback: AuthRequestCallback | null;
  setAuthRequestCallback: (callback: AuthRequestCallback | null) => void;

  // Account management
  createAccount: (name: string, pin: string) => Promise<ManagedAccount>;
  deleteAccount: (address: string) => Promise<void>;
  renameAccount: (address: string, newName: string) => Promise<void>;
  getAccountData: (address: string) => AccountData | undefined;
  setCurrentAccount: (address: string) => void;
  logout: () => Promise<void>;

  // Authentication method management (only operate on current account)
  addPasskeyAuth: () => Promise<void>;
  removePasskeyAuth: () => Promise<void>;
  changePinAuth: (oldPin: string, newPin: string) => Promise<void>;

  // Session configuration (only operate on current account)
  setSessionDuration: (duration: number) => void;
  getSessionExpiresAt: () => number | null;

  // Internal methods
  _getPrivateKey: (forceAuth?: boolean) => Promise<Hex>;
  _authenticateWithPin: (pin: string) => Promise<Hex>;
  _authenticateWithPasskey: () => Promise<Hex>;
  _createSession: (sessionKey: string) => void;
  _clearSession: () => void;
  _isSessionActive: () => boolean;
  _unlockPrivateKeyWithSessionKey: (sessionKey: string) => Promise<Hex>;
}

type AccountStorePersistedState = {
  accounts: AccountData[];
  account: { address: Hex } | null;
};

const createManagedAccount = (
  address: Hex,
  helpers: Pick<AccountStoreState, '_getPrivateKey' | '_isSessionActive'>,
): ManagedAccount => {
  const getUnlockedAccount = async () => {
    const privateKey = await helpers._getPrivateKey();
    return privateKeyToAccount(privateKey);
  };

  return {
    address,
    type: 'local',
    source: 'custom',
    publicKey: '0x' as Hex,
    sign: async ({ hash }: { hash: Hash }) => {
      const account = await getUnlockedAccount();
      return account.sign({ hash });
    },
    isLocked: () => !helpers._isSessionActive(),
    signMessage: async ({ message }: { message: SignableMessage }) => {
      const account = await getUnlockedAccount();
      return account.signMessage({ message });
    },
    signTransaction: async (transaction: TransactionSerializable) => {
      const account = await getUnlockedAccount();
      return account.signTransaction(transaction);
    },
    signTypedData: async (parameters: any) => {
      const account = await getUnlockedAccount();
      return account.signTypedData(parameters);
    },
    DANGEROUS_exportPrivateKey: async () => {
      return await helpers._getPrivateKey(true);
    },
  };
};

export const AccountStore = create<AccountStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      accounts: [],
      account: null,
      authRequestCallback: null,

      // ==================== Set authorization callback ====================

      setAuthRequestCallback: (callback) => {
        set({ authRequestCallback: callback });
      },

      // ==================== Account management ====================

      createAccount: async (name, pin) => {
        if (!pin) {
          throw new Error('Creating account must provide PIN code');
        }

        if (pin.length < 6) {
          throw new Error('PIN code must be at least 6 digits');
        }

        // Generate private key
        const privateKey = generatePrivateKey();
        const tempAccount = privateKeyToAccount(privateKey);

        const authMethods: AuthMethodConfig = {};

        // Add PIN authentication (required)
        authMethods.pin = await encryptPrivateKey(
          privateKey,
          pin,
          AUTH_CONFIG.pbkdf2Iterations,
        );

        const account: AccountData = {
          address: tempAccount.address, // Use address as primary key
          name,
          authMethods,
          sessionDuration: AUTH_CONFIG.defaultSessionDuration,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        // Data will be automatically synchronized to IndexedDB through persist middleware

        // Generate sessionKey and create initial session (because user has just entered authentication information)
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

        // Create ManagedAccount
        const managedAccount = createManagedAccount(
          tempAccount.address as Hex,
          get(),
        );

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
        if (!account) throw new Error('Account does not exist');

        const updatedAccount = {
          ...account,
          name: newName,
          updatedAt: Date.now(),
        };

        // Data will be automatically synchronized to IndexedDB through persist middleware

        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.address === address ? updatedAccount : a,
          ),
        }));
      },

      getAccountData: (address) => {
        return get().accounts.find((a) => a.address === address);
      },

      // ==================== Set current account ====================

      setCurrentAccount: (address) => {
        const accountData = get().accounts.find((a) => a.address === address);
        if (!accountData) throw new Error('Account does not exist');

        const { _getPrivateKey, _isSessionActive } = get();

        // Create ManagedAccount
        const managedAccount = createManagedAccount(
          accountData.address as Hex,
          { _getPrivateKey, _isSessionActive },
        );

        set({ account: managedAccount });

        // Reload to ensure all account-scoped data resets cleanly
        if (typeof window !== 'undefined') {
          void (async () => {
            try {
              await db.accounts.toCollection().modify((record) => {
                const isCurrent = record.address === address;
                if (record.isCurrent !== isCurrent) {
                  record.isCurrent = isCurrent;
                  record.updatedAt = Date.now();
                }
              });
              const currentRecord = await db.accounts.get(address);
              if (!currentRecord) {
                await db.accounts.put({
                  address,
                  data: accountData,
                  isCurrent: true,
                  updatedAt: Date.now(),
                });
              }
            } catch (error) {
              console.error(
                'Failed to update current account flag in IndexedDB:',
                error,
              );
            }

            window.location.reload();
          })();
        }
      },

      logout: async () => {
        const currentAccount = get().account;

        if (currentAccount) {
          sessionManager.clearSession(currentAccount.address);
          tempEncryptedPrivateKey.delete(currentAccount.address);
        }

        set({ account: null });

        if (typeof window !== 'undefined') {
          try {
            await db.accounts
              .filter((record) => record.isCurrent === true)
              .modify((record) => {
                record.isCurrent = false;
                record.updatedAt = Date.now();
              });
          } catch (error) {
            console.error(
              'Failed to clear current account flag in IndexedDB:',
              error,
            );
          }

          window.location.reload();
        }
      },

      // ==================== Authentication Method Management ====================

      addPasskeyAuth: async () => {
        const { _getPrivateKey, account } = get();

        if (!account) {
          throw new Error('No current account');
        }

        if (!IS_PASSKEY_SUPPORTED) {
          throw new Error('Current browser does not support Passkey');
        }

        const accountData = get().accounts.find(
          (a) => a.address === account.address,
        );
        if (!accountData) throw new Error('Current account does not exist');

        // Need to get private key first (may require authorization)
        const privateKey = await _getPrivateKey(true);

        const challenge = crypto.getRandomValues(new Uint8Array(32));
        // Use account address as user identifier
        const userIdBytes = new TextEncoder().encode(accountData.address);

        // Build a friendlier label for the passkey record shown in platform UIs
        const shortAddr = `${accountData.address.slice(0, 6)}...${accountData.address.slice(-4)}`;
        const passkeyDisplayName = `xNUWA Wallet: ${accountData.name} (${shortAddr})`;

        const registrationOptions: PublicKeyCredentialCreationOptionsJSON = {
          challenge: bufferToBase64(challenge),
          rp: {
            name: AUTH_CONFIG.appName,
            id: window.location.hostname,
          },
          user: {
            id: bufferToBase64(userIdBytes),
            // Keep a stable, unique username for the credential
            name: passkeyDisplayName,
            // Display name shown in most passkey pickers / system UIs
            displayName: passkeyDisplayName,
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

        // Data will be automatically synchronized to IndexedDB through persist middleware

        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.address === account.address ? updatedAccount : a,
          ),
        }));
      },

      removePasskeyAuth: async () => {
        const { account } = get();

        if (!account) {
          throw new Error('No current account');
        }

        const accountData = get().accounts.find(
          (a) => a.address === account.address,
        );
        if (!accountData) throw new Error('Current account does not exist');
        if (!accountData.authMethods.passkey) {
          throw new Error(
            'This account has not enabled Passkey authentication',
          );
        }

        const updatedAccount = {
          ...accountData,
          authMethods: {
            ...accountData.authMethods,
            passkey: undefined,
          },
          updatedAt: Date.now(),
        };

        // Data will be automatically synchronized to IndexedDB through persist middleware

        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.address === account.address ? updatedAccount : a,
          ),
        }));
      },

      changePinAuth: async (oldPin, newPin) => {
        const { account } = get();

        if (!account) {
          throw new Error('No current account');
        }

        const accountData = get().accounts.find(
          (a) => a.address === account.address,
        );
        if (!accountData) throw new Error('Current account does not exist');
        if (!accountData.authMethods.pin)
          throw new Error('PIN authentication not set');

        // Decrypt and verify with old PIN
        const privateKey = await decryptPrivateKey(
          accountData.authMethods.pin,
          oldPin,
          AUTH_CONFIG.pbkdf2Iterations,
        );

        // Re-encrypt with new PIN
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

        // Data will be automatically synchronized to IndexedDB through persist middleware

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
          throw new Error('No current account');
        }

        const accountData = get().accounts.find(
          (a) => a.address === account.address,
        );
        if (!accountData) throw new Error('Current account does not exist');

        const updatedAccount = {
          ...accountData,
          sessionDuration: duration,
          updatedAt: Date.now(),
        };

        // Data will be automatically synchronized to IndexedDB through persist middleware

        // Update store
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.address === account.address ? updatedAccount : a,
          ),
        }));
      },

      getSessionExpiresAt: () => {
        const { account } = get();
        if (!account) return null;
        return sessionManager.getSessionExpiresAt(account.address);
      },

      // ==================== Internal Methods ====================

      // Core: Get private key (automatically handle session and authorization)
      _getPrivateKey: async (forceAuth = false) => {
        const { account } = get();

        if (!account) {
          throw new Error('No current account');
        }

        // If not forced authorization, check session first
        if (!forceAuth) {
          const sessionKey = sessionManager.getSessionKey(account.address);
          if (sessionKey) {
            // Use sessionKey to unlock private key
            return await get()._unlockPrivateKeyWithSessionKey(sessionKey);
          }
        }

        // Authorization required, try passkey first, fallback to PIN on failure
        const accountData = get().accounts.find(
          (a) => a.address === account.address,
        );
        if (!accountData) throw new Error('Current account does not exist');

        let privateKey: Hex;

        // If passkey authentication exists, try it first
        if (accountData.authMethods.passkey) {
          try {
            privateKey = await get()._authenticateWithPasskey();
          } catch (passkeyError) {
            // Passkey failed, fallback to PIN
            const {
              authRequestCallback,
              _authenticateWithPin,
              _authenticateWithPasskey,
            } = get();

            if (!authRequestCallback) {
              throw new Error(
                'Authorization callback not set, cannot authorize',
              );
            }

            const reason = forceAuth
              ? 'export_private_key'
              : 'sign_transaction';
            const authResult = await authRequestCallback(
              account.address,
              reason,
              true,
            ); // Pass fallback flag

            if (authResult.method === 'passkey') {
              privateKey = await _authenticateWithPasskey();
            } else if (authResult.method === 'pin' && authResult.pin) {
              privateKey = await _authenticateWithPin(authResult.pin);
            } else {
              throw new Error('PIN cannot be empty');
            }
          }
        } else {
          // No passkey, use PIN directly
          const { authRequestCallback, _authenticateWithPin } = get();

          if (!authRequestCallback) {
            throw new Error('Authorization callback not set, cannot authorize');
          }

          const reason = forceAuth ? 'export_private_key' : 'sign_transaction';
          const authResult = await authRequestCallback(account.address, reason);

          if (authResult.method !== 'pin' || !authResult.pin) {
            throw new Error('PIN cannot be empty');
          }
          privateKey = await _authenticateWithPin(authResult.pin);
        }

        // If not exporting private key, create session and store encrypted private key
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
          throw new Error('No current account');
        }

        const accountData = get().accounts.find(
          (a) => a.address === account.address,
        );
        if (!accountData) throw new Error('Current account does not exist');
        if (!accountData.authMethods.pin)
          throw new Error('This account has not enabled PIN authentication');

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
          throw new Error('No current account');
        }

        const accountData = get().accounts.find(
          (a) => a.address === account.address,
        );
        if (!accountData) throw new Error('Current account does not exist');
        if (!accountData.authMethods.passkey)
          throw new Error(
            'This account has not enabled Passkey authentication',
          );

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

      // ==================== Internal Session Management ====================

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
          throw new Error('No current account');
        }

        const encryptedPrivateKey = tempEncryptedPrivateKey.get(
          account.address,
        );
        if (!encryptedPrivateKey) {
          throw new Error('Session expired, re-authentication required');
        }

        try {
          const privateKey = await decryptWithSessionKey(
            encryptedPrivateKey,
            sessionKey,
          );
          return privateKey as Hex;
        } catch (error) {
          throw new Error('Session expired, re-authentication required');
        }
      },
    }),
    {
      ...createAccountStatePersistConfig<
        AccountStoreState,
        AccountStorePersistedState
      >({
        name: 'account-store',
        partialize: (state) => ({
          accounts: state.accounts,
          account: state.account ? { address: state.account.address } : null,
          // Do not persist runtime state like authRequestCallback
        }),
      }),
      merge: (persistedState, currentState) => {
        type PersistedAccountState = Partial<AccountStorePersistedState>;

        const typedState = (persistedState || {}) as PersistedAccountState;
        const mergedState = {
          ...currentState,
          accounts: typedState.accounts ?? currentState.accounts,
        } as AccountStoreState;

        const persistedAccountAddress = typedState.account?.address;
        if (persistedAccountAddress) {
          const accountData = mergedState.accounts.find(
            (a) => a.address === persistedAccountAddress,
          );
          mergedState.account = accountData
            ? createManagedAccount(accountData.address as Hex, currentState)
            : null;
        } else {
          mergedState.account = null;
        }

        return mergedState;
      },
    },
  ),
);

setAccountAddressResolver(() => {
  if (typeof window === 'undefined') {
    return null;
  }
  return AccountStore.getState().account?.address ?? null;
});
