import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-gray-950 to-gray-900">
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link
            to="/"
            className="text-xl font-bold text-indigo-400 inline-flex items-center gap-2"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#269"
                d="M0 29a4 4 0 0 0 4 4h24a4 4 0 0 0 4-4V12a4 4 0 0 0-4-4h-9c-3.562 0-3-5-8.438-5H4a4 4 0 0 0-4 4v22z"
              />
              <path
                fill="#818cf8"
                d="M30 10h-6.562C18 10 18.562 15 15 15H6a4 4 0 0 0-4 4v10a1 1 0 1 1-2 0a4 4 0 0 0 4 4h26a4 4 0 0 0 4-4V14a4 4 0 0 0-4-4z"
              />
            </svg>
            Warp
          </Link>
          <span className="text-sm text-gray-500 ml-2">
            Secure temporary file storage
          </span>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-10 flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-gray-800 bg-gray-950/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
