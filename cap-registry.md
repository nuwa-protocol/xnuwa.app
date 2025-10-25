# Nuwa 注册系统（GitHub → Supabase，同步 + Web3 登录）设计文档

> 版本：v1.0
> 作者：—
> 目标读者：产品、后端/前端工程师、运维

---

## 1. 背景 & 目标

* **注册形式**：用户按约定格式在 GitHub 仓库提交 YAML 文件（PR/Push）。
* **自动同步**：Supabase Edge Function 监听 GitHub Webhook/定时任务，解析 YAML 并 **UPSERT** 到数据库。
* **访问方式**：客户端使用 **Web3 钱包登录（SIWE/EIP-4361）** 获取 Supabase 会话，随后读表与提交交互数据。
* **安全目标**：前端仅持有 `anon key`（可公开）；写操作由 RLS + Auth 约束；服务端敏感密钥仅存放在 Edge Function Secrets。

---

## 2. 架构总览

```text
┌────────────────┐    push/PR    ┌────────────────────────────┐
│   GitHub Repo  │──────────────▶│ GitHub Webhook (push event)│
└────────────────┘               └─────────────┬──────────────┘
                                               │
                                               ▼
                               ┌──────────────────────────────────┐
                               │ Supabase Edge Function: sync     │
                               │  - 校验签名                       │
                               │  - 拉取/解析 YAML → JSON          │
                               │  - UPSERT → resources/source_files│
                               └────────────────┬─────────────────┘
                                                │
                             ┌──────────────────▼──────────────────┐
                             │           Supabase DB               │
                             │  resources / source_files /         │
                             │  interactions / user_profiles       │
                             └─────────────────┬───────────────────┘
                                               │
                 SIWE 登录/获取会话            │  RLS 受控查询/写入
  ┌──────────────────────┐                 ┌───▼───────────────────────┐
  │  Client (Web/Mobile) │ ─────────────▶ │  Supabase Auth + Policies │
  └──────────────────────┘                 └───────────────────────────┘
```

**同步模式**

* **Webhook 实时**（推荐）：推送即触发函数，解析变更。
* **Cron 兜底**：定时全量/增量扫描，防丢投递。 

---

## 3. 数据模型（Schema）
- caps 表存储索引的 cap 数据，提供部署好的 sql 用于客户端查询数据
- caps-metadata 表存储 cap 相关的数据
- interactions 表存储用户的交互数据，交互类型包括钱包创建，cap 收藏，cap 评分等等

### 3.1 RLS & 策略

```sql
alter table resources enable row level security;
alter table interactions enable row level security;
alter table user_profiles enable row level security;

-- resources：登录用户可读（若需完全公开阅读，改为 to public）
create policy "read resources" on resources
for select to authenticated using (true);

-- interactions：仅允许用户写入/读取自己的交互
create policy "insert own interaction" on interactions
for insert to authenticated with check (auth.uid() = user_id);

create policy "read own interaction" on interactions
for select to authenticated using (auth.uid() = user_id);
```

> 管理员/统计可在服务端使用 `service_role`（绕过 RLS）。

---

## 4. YAML 格式（示例）

```yaml
slug: "abc"
title: "Awesome ABC"
category: "tooling"
tags: ["cli", "productivity"]
meta:
  homepage: "https://abc.example"
```

**路径约定**：如 `items/**.yaml`。`slug` 作为业务主键（唯一）。

---

## 5. Web3 登录流程（SIWE/EVM）

1. **生成挑战（challenge）**：客户端向 Supabase 请求一段带 `domain/uri/nonce/issuedAt` 的待签名消息。
2. **本地签名**：用户用钱包（或本地私钥）**签名该消息**。私钥不出端。
3. **验证换取会话**：把签名与消息提交给 Supabase **Web3 Verify** 接口，返回 `session`（JWT）。
4. **携带会话访问**：SDK 持有 session 后即可受 RLS 保护地读写数据库。

> * 若使用 Next.js + 服务器组件/BFF，可由服务端持有会话并下发 HttpOnly Cookie。
> * 若仅前端直连，按 SDK 默认持有 `access_token/refresh_token`。

### 5.1 前端最小示例（Viem + Supabase JS）

```ts
import { createClient } from '@supabase/supabase-js';
import { createWalletClient, custom } from 'viem';
import { mainnet } from 'viem/chains';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL!, import.meta.env.VITE_SUPABASE_ANON!);

// 连接钱包
const wallet = createWalletClient({ chain: mainnet, transport: custom((window as any).ethereum) });
const [address] = await wallet.requestAddresses();

// 1) 请求挑战
const { data: challenge, error: chErr } = await (supabase as any).auth.signInWithWeb3.createChallenge({
  address,
  chain: 'ethereum'
});
if (chErr) throw chErr;

// 2) 本地签名
const signature = await wallet.signMessage({ account: address, message: challenge.message });

// 3) 验证换取 Supabase 会话
const { data: session, error: vErr } = await (supabase as any).auth.signInWithWeb3.verify({
  address,
  chain: 'ethereum',
  message: challenge.message,
  signature
});
if (vErr) throw vErr;

// 4) 之后即可正常查询/写入（受 RLS）
const { data: list } = await supabase
  .from('caps')
  .select('id, tags')
  .order('updated_at', { ascending: false })
  .range(0, 19);

// 写入交互
const user = (await supabase.auth.getUser()).data.user;
await supabase.from('interactions').insert({
  user_id: user!.id,
  resource_id: list![0].id,
  action: 'like',
  payload: { source: 'web' }
});
```

---

## 6. Edge Function：Webhook 同步（Deno）

**Secrets**：`SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`、`GH_TOKEN`（可选）、`GH_WEBHOOK_SECRET`。

> 只展示核心逻辑骨架，完整版本应包含错误处理与批量 upsert。

```ts
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as YAML from 'https://deno.land/std@0.224.0/yaml/mod.ts';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const GH_TOKEN = Deno.env.get('GH_TOKEN');
const GH_SECRET = Deno.env.get('GH_WEBHOOK_SECRET')!;

async function verifySig(secret: string, body: string, sig: string | null) {
  if (!sig) return false;
  const [algo, hex] = sig.split('=');
  if (algo !== 'sha256') return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(body));
  const expected = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('');
  return expected === hex;
}

async function fetchRaw(repo: string, path: string) {
  const url = `https://raw.githubusercontent.com/${repo}/HEAD/${path}`;
  const r = await fetch(url, GH_TOKEN ? { headers: { Authorization: `Bearer ${GH_TOKEN}` } } : {});
  if (r.ok) return await r.text();
  throw new Error(`fetch raw failed: ${r.status}`);
}

serve(async (req) => {
  const body = await req.text();
  const ok = await verifySig(GH_SECRET, body, req.headers.get('X-Hub-Signature-256'));
  if (!ok) return new Response('invalid signature', { status: 401 });

  if (req.headers.get('X-GitHub-Event') !== 'push') return new Response('ignored', { status: 200 });

  const payload = JSON.parse(body);
  const repo = payload.repository.full_name as string;
  const headSha = payload.head_commit.id as string;

  const changed: string[] = [
    ...(payload.head_commit?.added ?? []),
    ...(payload.head_commit?.modified ?? []),
  ].filter((p: string) => p.endsWith('.yaml') || p.endsWith('.yml'));

  for (const path of changed) {
    const raw = await fetchRaw(repo, path);
    const doc: any = YAML.parse(raw);

    const record = {
      slug: doc.slug,
      title: doc.title,
      category: doc.category ?? null,
      tags: doc.tags ?? [],
      meta: doc.meta ?? {},
      source_repo: repo,
      source_path: path,
      source_sha: headSha,
      updated_at: new Date().toISOString()
    };

    await supabase.from('resources').upsert(record, { onConflict: 'slug' });
    await supabase.from('source_files').upsert({ repo, path, sha: headSha }, { onConflict: 'repo,path' });
  }

  return new Response('ok');
});
```

---

## 7. Webhook 配置清单（GitHub）

* **Payload URL**：`https://<project-ref>.supabase.co/functions/v1/github-sync`
* **Content type**：`application/json`
* **Secret**：随机字符串（与 Edge Function 中的 `GH_WEBHOOK_SECRET` 一致）
* **Which events?**：`Just the push event`（最小化）
* **Active**：✅

> 如需增量处理 PR，可额外监听 `pull_request` 并在合并后处理；或在 CI 中做 YAML 结构校验。

---

## 8. 前端数据访问 & 交互写入

### 8.1 查询资源

```ts
const { data, error } = await supabase
  .from('resources')
  .select('id, slug, title, category, tags')
  .order('updated_at', { ascending: false })
  .range(0, 19);
```

### 8.2 写入交互

```ts
const user = (await supabase.auth.getUser()).data.user;
await supabase.from('interactions').insert({
  user_id: user!.id,
  resource_id: resourceId,
  action: 'like',
  payload: { via: 'web' }
});
```

> 如需匿名可读，将 `resources` 的读取策略放宽到 `to public`，交互仍只允许 `authenticated`。

---

## 9. 安全与合规

* **最小暴露**：前端仅保存 `anon key`；任何写入权限都受 RLS 与用户会话约束。
* **密钥隔离**：`service_role`、`GH_TOKEN`、`GH_WEBHOOK_SECRET` 仅存 Edge Function Secrets。
* **重放防护**：挑战消息包含 `domain/uri/nonce/issuedAt`；签名仅一次有效。
* **软删除/回滚**：GitHub 删除文件时，可将 `resources` 增加 `is_active` 字段做软删除（保留审计）。
* **速率与并发**：批量 UPSERT；必要时引入队列/去抖；函数设置超时/重试策略。

---

## 10. 部署 & 运维清单

* [ ] Supabase 项目：创建表、开启 RLS、执行策略 SQL。
* [ ] Auth：启用 **Sign in with Web3**（EVM/Solana），配置登录域名。
* [ ] Edge Function：部署 `github-sync`，注入 Secrets。
* [ ] Webhook：在 GitHub 仓库配置 push 事件，设置 Secret。
* [ ] 定时任务（可选）：创建 `github-sync-cron`，设置 Crontab。
* [ ] 前端：引入 Supabase SDK + Web3 SDK（viem/wagmi），实现 SIWE 登录与数据读写。
* [ ] 监控：为 Edge Function 添加日志与告警；为表写入失败建立死信或审计表。

---

## 11. 可扩展方向

* **CI 校验**：PR 阶段运行 YAML schema 校验（Ajv/JSON Schema），失败阻止合并。
* **多仓聚合**：支持多 repo 同步，增加 `org`/`repo` 字段索引与隔离策略。
* **版本管理**：建立 `resource_versions` 记录每次变更快照，支持回滚与对比。
* **搜索与推荐**：为 `title/tags/meta` 建全文索引，结合交互表做推荐。
* **Realtime**：订阅 `resources`/`interactions` 变化，前端实时刷新。

---

## 12. 风险与对策

| 风险               | 影响              | 对策                                      |
| ------------------ | ----------------- | ----------------------------------------- |
| Webhook 丢失/延迟  | 数据不同步        | 增加 Cron 定时全量兜底；幂等 UPSERT       |
| YAML 结构变更      | 解析失败/字段缺失 | 版本化 schema；兼容解析；CI 校验          |
| 大批量提交         | 函数超时          | 分批处理/队列；加大超时；批量 UPSERT      |
| 权限误配           | 数据外泄或越权    | 全表开启 RLS；最小策略；例行权限审计      |
| 私钥泄露（客户端） | 用户资产风险      | 私钥仅用于签名，不上传；推荐硬件/托管钱包 |

---

## 13. FAQ

* **前端必须有 anon key 吗？** 必须（直连 Supabase 时）。它是可公开的发布键，不代表用户身份；安全由 RLS 保证。若想完全隐藏，可引入 BFF。
* **支持 Solana 吗？** 暂时不用支持
* **如何做公开读取？** 将 `resources` 的读取策略放宽到 `to public`；其他写入表保持 `authenticated`。

