import { useState } from "react";
import type { UploadResponse } from "@/lib/api";

interface UploadResultProps {
  result: UploadResponse;
  onReset: () => void;
}

export function UploadResult({ result, onReset }: UploadResultProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const fullUrl = `${window.location.origin}${result.url}`;

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(result.short_id);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Success header */}
      <div className="fade-up" style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "var(--success-dim)",
            border: "1px solid rgba(61,255,160,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <CheckIcon />
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: "16px", color: "var(--success)" }}>
            {result.file_count > 1 ? `${result.file_count} files warped!` : "File warped!"}
          </p>
          <p style={{ fontSize: "13px", color: "var(--text-2)", marginTop: "3px" }}>
            {result.file_count > 1
              ? `${result.file_count} files bundled into a ZIP`
              : result.original_filename}
          </p>
          {result.expires_at && (
            <p style={{ fontSize: "12px", color: "var(--text-2)", marginTop: "3px" }}>
              Expires {new Date(result.expires_at).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Warp code — big and prominent */}
      <div
        className="card-inner fade-up-delay-1"
        style={{ padding: "24px 20px", textAlign: "center" }}
      >
        <p className="field-label" style={{ marginBottom: "14px" }}>
          Warp Code
        </p>
        <div className="warp-code-display" style={{ marginBottom: "18px" }}>
          {result.short_id}
        </div>
        <button
          onClick={handleCopyCode}
          className={`btn-ghost${copiedCode ? " copied" : ""}`}
          style={{ width: "100%" }}
        >
          {copiedCode ? <CheckSmallIcon /> : <CopyIcon />}
          {copiedCode ? "Copied!" : "Copy code"}
        </button>
      </div>

      {/* Full URL */}
      <div className="fade-up-delay-2">
        <p className="field-label">Full link</p>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={fullUrl}
            readOnly
            className="warp-input font-mono"
            style={{ fontSize: "12px", color: "var(--text-2)" }}
          />
          <button
            onClick={handleCopyUrl}
            className={`btn-ghost${copiedUrl ? " copied" : ""}`}
            style={{ flexShrink: 0 }}
          >
            {copiedUrl ? <CheckSmallIcon /> : <LinkIcon />}
            {copiedUrl ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <button onClick={onReset} className="btn-secondary fade-up-delay-3">
        New warp
      </button>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--success)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckSmallIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
