import { useState } from "react";
import type { UploadResponse } from "@/lib/api";

interface UploadResultProps {
  result: UploadResponse;
  onReset: () => void;
}

export function UploadResult({ result, onReset }: UploadResultProps) {
  const [copied, setCopied] = useState(false);

  const fullUrl = `${window.location.origin}${result.url}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="bg-green-500/10 border border-green-800 rounded-lg p-4">
        <p className="text-green-400 font-medium mb-2">File uploaded!</p>
        <p className="text-sm text-gray-300 mb-1">
          {result.original_filename}
        </p>
        {result.expires_at && (
          <p className="text-sm text-gray-400">
            Expires: {new Date(result.expires_at).toLocaleString()}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={fullUrl}
          readOnly
          className="flex-1 px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 text-sm"
        />
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-500 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <button
        onClick={onReset}
        className="w-full py-2 px-4 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
      >
        Upload another file
      </button>
    </div>
  );
}
