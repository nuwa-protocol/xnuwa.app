import { useRouteError, isRouteErrorResponse } from "react-router";

export default function ErrorPage() {
  const error = useRouteError();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">Oops!</h1>
        <p className="text-xl text-gray-600 mb-4">抱歉，发生了意外错误。</p>
        <p className="text-lg text-gray-500 italic">
          {isRouteErrorResponse(error)
            ? error.statusText || error.status
            : "未知错误"}
        </p>
      </div>
    </div>
  );
}
