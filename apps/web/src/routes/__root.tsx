import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900">
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link to="/" className="text-xl font-bold text-indigo-400">
            Warp
          </Link>
          <span className="text-sm text-gray-500 ml-2">
            Secure temporary file storage
          </span>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-10">
        <Outlet />
      </main>
    </div>
  );
}
