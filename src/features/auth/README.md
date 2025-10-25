# Auth Store 文档

## 概述

Auth Store 是一个基于 Zustand 的账户管理系统，提供安全的私钥管理、多种认证方式（PIN码、Passkey）和会话管理功能。该系统使用 Dexie 进行本地数据持久化，支持 viem 账户接口。

## 核心特性

### 1. 多重认证方式
- **PIN码认证**：基于 PBKDF2 的密码学安全认证
- **Passkey认证**：支持 WebAuthn 标准的生物识别认证
- **混合认证**：支持同时配置多种认证方式，优先使用 Passkey

### 2. 安全的会话管理
- **SessionKey机制**：私钥不直接存储在会话中，使用 sessionKey 加密
- **临时存储**：私钥仅在内存中临时存储，页面刷新后需重新认证
- **自动过期**：会话有明确的过期时间，过期后自动清除
- **透明管理**：组件无需关心会话状态，自动处理认证流程

### 3. 完整的账户生命周期
- **创建账户**：生成私钥并设置初始认证方式
- **账户管理**：重命名、删除、切换账户
- **认证管理**：添加/移除认证方式，修改PIN码
- **会话配置**：设置会话过期时间，查询剩余时间

## 架构设计

### 数据层
- **Dexie数据库**：存储账户元数据（地址、名称、认证配置等）
- **临时存储**：使用 Map 存储加密的私钥，页面刷新后清除
- **Session管理**：独立的 SessionManager 处理会话生命周期

### 状态层
- **Zustand Store**：管理应用状态和业务逻辑
- **账户状态**：当前账户、账户列表、认证回调
- **会话状态**：自动管理会话创建、验证、清除

### 安全层
- **加密存储**：私钥使用 PBKDF2 或 Passkey 派生密钥加密
- **会话加密**：临时私钥使用 sessionKey 加密存储
- **认证流程**：支持 PIN码 和 Passkey 双重认证

## API 参考

### 状态属性
```typescript
interface AccountStoreState {
  // 状态
  accounts: AccountData[];           // 账户列表
  account: ManagedAccount | null;   // 当前账户
  authRequestCallback: AuthRequestCallback | null; // 授权回调
}
```

### 账户管理方法
```typescript
// 创建账户
createAccount(name: string, pin: string): Promise<ManagedAccount>

// 删除账户
deleteAccount(address: string): Promise<void>

// 重命名账户
renameAccount(address: string, newName: string): Promise<void>

// 获取账户信息
getAccount(address: string): AccountData | undefined

// 设置当前账户
setCurrentAccount(address: string): void
```

### 认证管理方法
```typescript
// 添加 Passkey 认证
addPasskeyAuth(): Promise<void>

// 移除 Passkey 认证
removePasskeyAuth(): Promise<void>

// 修改 PIN 码
changePinAuth(oldPin: string, newPin: string): Promise<void>
```

### 会话管理方法
```typescript
// 设置会话过期时间
setSessionDuration(duration: number): void

// 获取会话过期时间戳（毫秒）
getSessionExpiresAt(): number | null

// 设置授权回调
setAuthRequestCallback(callback: AuthRequestCallback | null): void
```

## 使用方式

### 基本使用
```typescript
import { useAccountStore } from './store';

const accountStore = useAccountStore();

// 获取当前账户
const currentAccount = accountStore.account;

// 检查是否锁定
if (currentAccount?.isLocked()) {
  // 账户已锁定，需要授权
}

// 签名操作（自动处理授权）
const signature = await currentAccount.signMessage({ message: "Hello" });
```

### 创建和管理账户
```typescript
// 创建新账户
const newAccount = await accountStore.createAccount("我的账户", "123456");

// 切换账户（设置后会自动刷新页面以加载对应数据）
accountStore.setCurrentAccount("0x...");

// 重命名账户
await accountStore.renameAccount("0x...", "新名称");

// 删除账户
await accountStore.deleteAccount("0x...");
```

### 认证方式管理
```typescript
// 添加 Passkey 认证
await accountStore.addPasskeyAuth();

// 修改 PIN 码
await accountStore.changePinAuth("旧PIN", "新PIN");

// 移除 Passkey 认证
await accountStore.removePasskeyAuth();
```

### 会话配置
```typescript
// 设置会话过期时间为 2 小时
accountStore.setSessionDuration(2 * 60 * 60 * 1000);

// 查询会话过期时间并自行计算剩余时间
const expiresAt = accountStore.getSessionExpiresAt();
const remainingTime = expiresAt ? expiresAt - Date.now() : 0;
```

### 授权回调设置
```typescript
accountStore.setAuthRequestCallback(async (address, reason, fallback) => {
  // 根据 reason 显示不同的授权界面
  if (reason === 'export_private_key') {
    // 显示导出私钥的确认界面
  } else {
    // 显示签名确认界面
  }
  
  // 如果有 fallback 标志，说明 Passkey 认证失败，需要 PIN 码
  if (fallback) {
    return {
      method: 'pin',
      pin: await promptForPin()
    };
  }
  
  return {
    method: 'pin', // 或 'passkey'
    pin: '123456' // 如果使用 PIN
  };
});
```

## 安全特性

### 1. 多层加密保护
- **PBKDF2加密**：PIN码使用 PBKDF2 派生密钥加密私钥
- **Passkey加密**：使用 WebAuthn 派生密钥加密私钥
- **SessionKey加密**：临时私钥使用随机 sessionKey 加密存储

### 2. 会话安全机制
- **SessionKey机制**：私钥不直接存储在会话中，使用 sessionKey 加密
- **临时存储**：私钥仅在内存中临时存储，页面刷新后需重新认证
- **自动过期**：会话有明确的过期时间，过期后自动清除
- **最小权限**：组件只能使用账户接口，不能直接访问私钥

### 3. 认证安全
- **多重认证**：支持 PIN码 和 Passkey 双重认证
- **认证优先级**：优先使用 Passkey，失败时回退到 PIN码
- **生物识别**：Passkey 支持生物识别认证
- **防暴力破解**：PIN码使用 PBKDF2 增加破解难度

### 4. 数据安全
- **本地存储**：所有数据存储在本地，不上传到服务器
- **加密存储**：敏感数据全部加密存储
- **自动清理**：会话过期后自动清除临时数据

## 技术实现

### 依赖库
```json
{
  "viem": "^2.x",                    // 以太坊账户管理
  "@simplewebauthn/browser": "^8.x", // WebAuthn 实现
  "zustand": "^4.x",                 // 状态管理
  "dexie": "^3.x"                    // 本地数据库
}
```

### 核心组件
- **AccountDatabase**：Dexie 数据库类，管理账户数据持久化
- **SessionManager**：会话管理器，处理会话生命周期
- **CryptoUtils**：加密工具类，处理各种加密操作
- **AccountStore**：Zustand store，管理应用状态

### 数据流
1. **创建账户**：生成私钥 → 加密存储 → 创建会话
2. **认证流程**：检查会话 → 需要时触发认证 → 创建新会话
3. **签名操作**：获取私钥 → 执行签名 → 返回结果
4. **会话管理**：自动检查过期 → 自动清除过期会话

## 最佳实践

### 1. 错误处理
```typescript
try {
  const signature = await account.signMessage({ message: "Hello" });
} catch (error) {
  if (error.message.includes('Session 已过期')) {
    // 处理会话过期
  } else if (error.message.includes('未设置授权回调')) {
    // 处理授权回调未设置
  }
}
```

### 2. 认证回调实现
```typescript
// 实现完整的认证回调
const authCallback: AuthRequestCallback = async (address, reason, fallback) => {
  // 显示认证界面
  const result = await showAuthDialog({
    address,
    reason,
    fallback,
    supportedMethods: ['pin', 'passkey']
  });
  
  return result;
};

accountStore.setAuthRequestCallback(authCallback);
```

### 3. 会话管理
```typescript
// 定期检查会话状态
setInterval(() => {
  const expiresAt = accountStore.getSessionExpiresAt();
  const remainingTime = expiresAt ? expiresAt - Date.now() : 0;
  if (remainingTime < 60000) { // 剩余时间少于1分钟
    showSessionWarning();
  }
}, 30000);
```

## 架构优势

1. **安全性**：多层加密保护，私钥不直接暴露
2. **简洁性**：组件使用简单，无需管理复杂状态
3. **自动化**：会话管理完全自动化，减少人为错误
4. **可配置**：会话过期时间可配置，适应不同场景
5. **透明性**：授权流程对组件透明，降低使用复杂度
6. **扩展性**：支持多种认证方式，易于扩展新的认证方法
