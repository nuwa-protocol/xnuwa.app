import { Outlet, Link, useLocation } from "react-router";

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Nuwa Client</h1>
          <nav className="flex space-x-4">
            <Link
              to="/"
              className={`px-4 py-2 rounded-md transition-colors ${
                location.pathname === "/"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              首页
            </Link>
            <Link
              to="/about"
              className={`px-4 py-2 rounded-md transition-colors ${
                location.pathname === "/about"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              关于
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
