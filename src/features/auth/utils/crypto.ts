import type { EncryptedData } from '../types';

// ==================== 加密工具 ====================

export async function encryptPrivateKey(
  privateKey: string,
  password: string,
  iterations = 100000,
): Promise<EncryptedData> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey'],
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    enc.encode(privateKey),
  );

  return {
    encrypted: Array.from(new Uint8Array(encrypted)),
    salt: Array.from(salt),
    iv: Array.from(iv),
  };
}

export async function decryptPrivateKey(
  encryptedData: EncryptedData,
  password: string,
  iterations = 100000,
): Promise<string> {
  try {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey'],
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new Uint8Array(encryptedData.salt),
        iterations,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(encryptedData.iv) },
      key,
      new Uint8Array(encryptedData.encrypted),
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    throw new Error('解密失败：密码错误或数据损坏');
  }
}

export async function deriveKeyFromCredential(
  credentialId: string,
): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(credentialId);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function bufferToBase64(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer));
}

export function isPasskeySupported(): boolean {
  return (
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === 'function'
  );
}

// ==================== Session Key 加密工具 ====================

/**
 * 使用 sessionKey 加密数据
 * @param data 要加密的数据
 * @param sessionKey 会话密钥
 * @returns 加密后的 base64 字符串
 */
export async function encryptWithSessionKey(
  data: string,
  sessionKey: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(sessionKey),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey'],
  );

  // 使用固定的 salt 和迭代次数（因为 sessionKey 本身就是随机的）
  const salt = new Uint8Array(16).fill(0); // 固定 salt，因为 sessionKey 已经足够随机
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 1000, // 较少的迭代次数，因为 sessionKey 已经足够随机
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encoder.encode(data),
  );

  // 将 iv 和加密数据组合，然后转换为 base64
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return bufferToBase64(combined);
}

/**
 * 使用 sessionKey 解密数据
 * @param encryptedData 加密的 base64 字符串
 * @param sessionKey 会话密钥
 * @returns 解密后的原始数据
 */
export async function decryptWithSessionKey(
  encryptedData: string,
  sessionKey: string,
): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(sessionKey),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey'],
    );

    // 使用相同的 salt 和迭代次数
    const salt = new Uint8Array(16).fill(0);
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 1000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    );

    // 从 base64 解码
    const combined = new Uint8Array(
      atob(encryptedData)
        .split('')
        .map((c) => c.charCodeAt(0)),
    );

    // 分离 iv 和加密数据
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encrypted,
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    throw new Error('解密失败：sessionKey 错误或数据损坏');
  }
}
