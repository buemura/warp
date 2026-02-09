import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PasswordPrompt } from "@/components/PasswordPrompt";
import {
  getFileInfo,
  accessFile,
  type FileInfoResponse,
} from "@/lib/api";

export const Route = createFileRoute("/$shortId")({
  component: FileAccessPage,
});

function FileAccessPage() {
  const { shortId } = Route.useParams();
  const [info, setInfo] = useState<FileInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    getFileInfo(shortId)
      .then(setInfo)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [shortId]);

  const handleDownload = async (password?: string) => {
    if (!info) return;
    setDownloading(true);
    setAccessError(null);

    try {
      const blob = await accessFile(shortId, password);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = info.original_filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setAccessError(err instanceof Error ? err.message : "Access denied");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400">Loading...</div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto bg-gray-800/50 rounded-xl shadow-lg p-8 text-center space-y-4 border border-gray-700">
        <p className="text-red-400 font-medium">{error}</p>
        <Link
          to="/"
          className="inline-block text-indigo-400 hover:text-indigo-300 text-sm"
        >
          Go to homepage
        </Link>
      </div>
    );
  }

  if (!info) return null;

  if (info.is_expired) {
    return (
      <div className="max-w-md mx-auto bg-gray-800/50 rounded-xl shadow-lg p-8 text-center space-y-4 border border-gray-700">
        <h2 className="text-xl font-semibold text-gray-100">File Expired</h2>
        <p className="text-gray-400">This file is no longer available. The link has expired.</p>
        <Link
          to="/"
          className="inline-block text-indigo-400 hover:text-indigo-300 text-sm"
        >
          Go to homepage
        </Link>
      </div>
    );
  }

  if (info.is_access_exhausted) {
    return (
      <div className="max-w-md mx-auto bg-gray-800/50 rounded-xl shadow-lg p-8 text-center space-y-4 border border-gray-700">
        <h2 className="text-xl font-semibold text-gray-100">
          Access Limit Reached
        </h2>
        <p className="text-gray-400">
          This file has reached its maximum number of accesses and is no longer
          available.
        </p>
        <Link
          to="/"
          className="inline-block text-indigo-400 hover:text-indigo-300 text-sm"
        >
          Go to homepage
        </Link>
      </div>
    );
  }

  if (info.requires_password) {
    return (
      <PasswordPrompt
        filename={info.original_filename}
        onSubmit={handleDownload}
        loading={downloading}
        error={accessError}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto bg-gray-800/50 rounded-xl shadow-lg p-8 text-center space-y-4 border border-gray-700">
      <h2 className="text-xl font-semibold text-gray-100">
        {info.original_filename}
      </h2>
      <p className="text-sm text-gray-400">
        {(info.file_size / 1024).toFixed(1)} KB &middot; {info.content_type}
      </p>
      {info.expires_at && (
        <p className="text-sm text-gray-500">
          Expires: {new Date(info.expires_at).toLocaleString()}
        </p>
      )}

      {accessError && (
        <p className="text-red-400 text-sm">{accessError}</p>
      )}

      <button
        onClick={() => handleDownload()}
        disabled={downloading}
        className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-colors"
      >
        {downloading ? "Downloading..." : "Download"}
      </button>
    </div>
  );
}
