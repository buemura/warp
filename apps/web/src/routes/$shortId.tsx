import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PasswordPrompt } from "@/components/PasswordPrompt";
import { getFileInfo, accessFile, type FileInfoResponse } from "@/lib/api";

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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "64px 0",
          gap: "16px",
        }}
      >
        <svg
          className="spinner"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        <p style={{ color: "var(--text-2)", fontSize: "14px" }}>Locating warp…</p>
      </div>
    );
  }

  if (error) {
    return (
      <StatusCard
        iconBg="var(--error-dim)"
        iconBorder="rgba(255,92,92,0.2)"
        icon={<AlertIcon />}
        title="Warp not found"
        titleColor="var(--error)"
        description={error}
      />
    );
  }

  if (!info) return null;

  if (info.is_expired) {
    return (
      <StatusCard
        iconBg="rgba(255,165,0,0.07)"
        iconBorder="rgba(255,165,0,0.2)"
        icon={<ClockIcon />}
        title="File Expired"
        description="This warp has expired and is no longer available."
      />
    );
  }

  if (info.is_access_exhausted) {
    return (
      <StatusCard
        iconBg="var(--error-dim)"
        iconBorder="rgba(255,92,92,0.2)"
        icon={<BanIcon />}
        title="Access Exhausted"
        description="This one-time warp has already been accessed."
      />
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
    <div className="card fade-up" style={{ padding: "26px 22px" }}>
      {/* File info */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "22px" }}>
        <div className="file-icon-wrap">
          <FileDocIcon />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontWeight: 700,
              fontSize: "16px",
              color: "var(--text)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {info.original_filename}
          </p>
          <p style={{ fontSize: "13px", color: "var(--text-2)", marginTop: "4px" }}>
            {formatFileSize(info.file_size)} · {info.content_type}
          </p>
          {info.expires_at && (
            <p style={{ fontSize: "12px", color: "var(--text-2)", marginTop: "4px" }}>
              Expires {new Date(info.expires_at).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {accessError && (
        <div
          style={{
            padding: "12px 14px",
            background: "var(--error-dim)",
            border: "1px solid rgba(255,92,92,0.18)",
            borderRadius: "11px",
            color: "var(--error)",
            fontSize: "13px",
            marginBottom: "16px",
          }}
        >
          {accessError}
        </div>
      )}

      <button onClick={() => handleDownload()} disabled={downloading} className="btn-primary">
        {downloading ? (
          <>
            <SpinnerIcon />
            Downloading…
          </>
        ) : (
          <>
            <DownloadIcon />
            Download File
          </>
        )}
      </button>
    </div>
  );
}

/* ─── Reusable status card ───────────── */
function StatusCard({
  iconBg,
  iconBorder,
  icon,
  title,
  titleColor,
  description,
}: {
  iconBg: string;
  iconBorder: string;
  icon: React.ReactNode;
  title: string;
  titleColor?: string;
  description: string;
}) {
  return (
    <div
      className="card fade-up"
      style={{ padding: "36px 22px", textAlign: "center", maxWidth: "400px", margin: "0 auto" }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: iconBg,
          border: `1px solid ${iconBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
        }}
      >
        {icon}
      </div>
      <p
        style={{
          fontWeight: 700,
          fontSize: "17px",
          color: titleColor ?? "var(--text)",
          marginBottom: "8px",
        }}
      >
        {title}
      </p>
      <p style={{ fontSize: "14px", color: "var(--text-2)", marginBottom: "24px" }}>
        {description}
      </p>
      <Link to="/" className="warp-link" style={{ fontSize: "14px" }}>
        ← Back to Warp
      </Link>
    </div>
  );
}

/* ─── Helpers ────────────────────────── */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ─── Icons ──────────────────────────── */
function AlertIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFA500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function BanIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  );
}

function FileDocIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <polyline points="13 2 13 9 20 9" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="8 17 12 21 16 17" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}
