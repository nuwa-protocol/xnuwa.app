export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        欢迎使用 Nuwa Client
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        这是一个使用 React + TypeScript + Tailwind CSS + React Router v7
        构建的现代化应用
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">快速开发</h2>
          <p className="text-gray-600">使用 Vite + SWC 实现超快的开发体验</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">类型安全</h2>
          <p className="text-gray-600">
            TypeScript 提供完整的类型检查和智能提示
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            现代化 UI
          </h2>
          <p className="text-gray-600">
            Tailwind CSS 实现快速、响应式的界面设计
          </p>
        </div>
      </div>
    </div>
  );
}
