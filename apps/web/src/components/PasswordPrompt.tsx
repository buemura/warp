import { useState } from "react";

interface PasswordPromptProps {
  filename: string;
  onSubmit: (password: string) => void;
  loading: boolean;
  error: string | null;
}

export function PasswordPrompt({
  filename,
  onSubmit,
  loading,
  error,
}: PasswordPromptProps) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) {
      onSubmit(password);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Password Required
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Enter the password to access{" "}
            <span className="font-medium">{filename}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={loading}
            autoFocus
          />

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={!password || loading}
            className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Verifying..." : "Access File"}
          </button>
        </form>
      </div>
    </div>
  );
}
