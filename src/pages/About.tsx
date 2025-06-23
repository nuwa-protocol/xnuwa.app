export default function About() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        关于 Nuwa Client
      </h1>
      <div className="prose prose-lg text-gray-600">
        <p className="mb-4">
          Nuwa Client 是一个现代化的 React 应用，采用了当前最佳的前端技术栈：
        </p>
        <ul className="list-disc list-inside space-y-2 mb-6">
          <li>
            <strong>React 18</strong> - 最新的 React 版本
          </li>
          <li>
            <strong>TypeScript</strong> - 类型安全的 JavaScript
          </li>
          <li>
            <strong>Vite + SWC</strong> - 极速的构建工具
          </li>
          <li>
            <strong>React Router v7</strong> - 现代化的路由管理
          </li>
          <li>
            <strong>Tailwind CSS</strong> - 实用优先的 CSS 框架
          </li>
          <li>
            <strong>ESLint</strong> - 代码质量检查
          </li>
        </ul>
        <p>
          这个技术栈提供了出色的开发体验，同时确保了代码的质量和应用的性能。
        </p>
      </div>
    </div>
  );
}
