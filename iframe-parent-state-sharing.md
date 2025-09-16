iframe ↔ parent 状态同步方案设计
🎯 目标

在 Parent 应用 与 Iframe 应用 之间实现 实时状态同步。

Iframe 刷新/重载 时能够 自动恢复状态。

Iframe 端开发者体验：只需像使用普通 Zustand store 一样使用，不需要额外学习复杂的同步逻辑。

Parent 端 不需要预先知道状态的类型或结构，可以直接存储和同步任意 key-value 数据。

🔑 技术选型

Zustand
提供前端状态管理的易用 API（React Hook 风格）。

Yjs
CRDT 库，保证状态在 parent ↔ iframe 之间同步时不会丢失或冲突。

Penpal
封装了 postMessage，用于安全、简洁地建立 parent ↔ iframe 通信通道。

🏗 架构设计
Parent (Yjs Doc + Y.Map)
   |
   | (Penpal, postMessage)
   v
Iframe (Yjs Doc + Zustand store)

Parent

维护一个 Yjs 文档 (Y.Doc)，其中的 ymap 存储所有共享状态。

不需要定义状态类型，支持任意 key-value。

提供方法给 iframe：

getSnapshot() → 获取完整状态快照（用于 iframe 初始化恢复）。

syncUpdate(update) → 接收 iframe 的增量更新。

当 parent 状态更新时，自动推送增量更新给 iframe。

Iframe

使用 SDK createIframeStore(initialState) 创建 Zustand store。

内部：

把 Zustand 与 Yjs 绑定（双向同步）。

建立 Penpal 通道，接收 parent 更新、发送本地更新。

启动时向 parent 请求快照，用于状态恢复。

对 iframe 开发者来说，使用方式和普通 Zustand store 完全一致。

📦 SDK 设计
Iframe SDK
// iframe-sdk.ts
export function createIframeStore<T extends object>(initialState: T) {
  // 返回值就是 Zustand 的 useStore Hook
}


使用方式：

const useStore = createIframeStore({ counter: 0 });

function IframeApp() {
  const { counter, setStateValue } = useStore();
  return (
    <div>
      <h2>Iframe Counter: {counter}</h2>
      <button onClick={() => setStateValue('counter', counter + 1)}>+1</button>
    </div>
  );
}

Parent Bridge
// parent-store.ts
export function setupIframeBridge(iframe: HTMLIFrameElement) {
  // 建立与 iframe 的 Penpal 连接
  // 返回 ydoc / ymap，支持在 parent 内操作状态
}


使用方式：

function ParentApp() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      setupIframeBridge(iframeRef.current);
    }
  }, []);

  return <iframe ref={iframeRef} src="/iframe.html" />;
}

⚙️ 数据流示意

Iframe 初始化

Iframe 调用 parent.getSnapshot() → 获取当前完整状态 → 应用到本地 Y.Doc → 恢复 Zustand。

状态更新 (Iframe → Parent)

Iframe 内调用 setStateValue("counter", 10) →

Zustand 更新 → 写入 Y.Map → 触发 Yjs update →

通过 Penpal 调用 parent.syncUpdate(update) → Parent Y.Doc 更新。

状态更新 (Parent → Iframe)

Parent 改变状态 → Y.Map 更新 → Yjs 触发 update →

Penpal child.syncUpdate(update) → Iframe 应用更新 → Zustand 更新。

✅ 特点

Iframe 端开发体验无感

使用方式和 Zustand store 一模一样，支持任意字段。

Parent 无需定义 schema

所有数据存储在 ymap，支持动态 key。

自动恢复状态

Iframe 刷新后，会从 parent 拿快照恢复，避免状态丢失。

实时同步 & 冲突解决

基于 Yjs CRDT 算法，支持并发修改时的最终一致性。