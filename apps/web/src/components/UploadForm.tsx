import { useState } from "react";
import { FileDropZone } from "./FileDropZone";
import { uploadFile, type UploadOptions, type UploadResponse } from "@/lib/api";

interface UploadFormProps {
  onUploadComplete: (result: UploadResponse) => void;
}

const TTL_OPTIONS = [
  { label: "5 minutes", value: "5" },
  { label: "15 minutes", value: "15" },
  { label: "30 minutes", value: "30" },
  { label: "1 hour", value: "60" },
  { label: "6 hours", value: "360" },
  { label: "24 hours", value: "1440" },
];

export function UploadForm({ onUploadComplete }: UploadFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");
  const [oneTime, setOneTime] = useState(false);
  const [ttl, setTtl] = useState("5");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (files.length === 0) return;
    setLoading(true);
    setError(null);

    const options: UploadOptions = {};
    if (password) options.password = password;
    if (oneTime) options.oneTime = true;
    if (ttl) options.ttlMinutes = Number(ttl);

    try {
      const result = await uploadFile(files, options);
      onUploadComplete(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const hasOptions = password || oneTime;

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <FileDropZone onFilesSelect={setFiles} selectedFiles={files} disabled={loading} />

      {/* Options toggle */}
      <button
        type="button"
        onClick={() => setShowOptions(!showOptions)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          background: "none",
          border: "none",
          color: showOptions ? "var(--text)" : "var(--text-2)",
          cursor: "pointer",
          fontSize: "13px",
          fontFamily: "'Syne', sans-serif",
          fontWeight: 500,
          padding: 0,
          alignSelf: "flex-start",
          transition: "color 0.14s",
        }}
      >
        <ChevronIcon open={showOptions} />
        Advanced options
        {hasOptions && (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--accent)",
              flexShrink: 0,
            }}
          />
        )}
      </button>

      {showOptions && (
        <div
          className="card-inner fade-up"
          style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}
        >
          {/* Password */}
          <div>
            <label htmlFor="password" className="field-label">
              Password protection (optional)
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave empty for no password"
              className="warp-input"
              disabled={loading}
            />
          </div>

          {/* One-time toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div>
              <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text)" }}>
                One-time access
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-2)", marginTop: "2px" }}>
                Link expires after first download
              </p>
            </div>
            <input
              id="oneTime"
              type="checkbox"
              checked={oneTime}
              onChange={(e) => setOneTime(e.target.checked)}
              className="warp-toggle"
              disabled={loading}
            />
          </div>

          {/* TTL */}
          <div>
            <label htmlFor="ttl" className="field-label">
              Expires after
            </label>
            <select
              id="ttl"
              value={ttl}
              onChange={(e) => setTtl(e.target.value)}
              className="warp-select"
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
      )}

      {error && (
        <div
          style={{
            padding: "12px 14px",
            background: "var(--error-dim)",
            border: "1px solid rgba(255, 92, 92, 0.18)",
            borderRadius: "11px",
            color: "var(--error)",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}

      <button type="submit" disabled={files.length === 0 || loading} className="btn-primary">
        {loading ? (
          <>
            <SpinnerIcon />
            Uploading...
          </>
        ) : (
          <>
            <UploadIcon />
            Upload & Warp
          </>
        )}
      </button>
    </form>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      className="spinner"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}
