import { useState } from "react";
import { FileDropZone } from "./FileDropZone";
import { uploadFile, type UploadOptions, type UploadResponse } from "@/lib/api";

interface UploadFormProps {
  onUploadComplete: (result: UploadResponse) => void;
}

const TTL_OPTIONS = [
  { label: "No expiry", value: "" },
  { label: "5 minutes", value: "5" },
  { label: "15 minutes", value: "15" },
  { label: "30 minutes", value: "30" },
  { label: "1 hour", value: "60" },
  { label: "6 hours", value: "360" },
  { label: "24 hours", value: "1440" },
];

export function UploadForm({ onUploadComplete }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [oneTime, setOneTime] = useState(false);
  const [ttl, setTtl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    const options: UploadOptions = {};
    if (password) options.password = password;
    if (oneTime) options.oneTime = true;
    if (ttl) options.ttlMinutes = Number(ttl);

    try {
      const result = await uploadFile(file, options);
      onUploadComplete(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FileDropZone
        onFileSelect={setFile}
        selectedFile={file}
        disabled={loading}
      />

      <div className="space-y-4">
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password protection (optional)
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave empty for no password"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="oneTime"
            type="checkbox"
            checked={oneTime}
            onChange={(e) => setOneTime(e.target.checked)}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            disabled={loading}
          />
          <label htmlFor="oneTime" className="text-sm text-gray-700">
            One-time access (link works only once)
          </label>
        </div>

        <div>
          <label
            htmlFor="ttl"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Expiration
          </label>
          <select
            id="ttl"
            value={ttl}
            onChange={(e) => setTtl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={loading}
          >
            {TTL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!file || loading}
        className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}
