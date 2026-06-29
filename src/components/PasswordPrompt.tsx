"use client";

import { useState } from "react";

interface PasswordPromptProps {
  filename: string;
  onSubmit: (password: string) => void;
  loading: boolean;
  error: string | null;
}

export function PasswordPrompt({ filename, onSubmit, loading, error }: PasswordPromptProps) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (password) onSubmit(password);
  };

  return (
    <div className="card fade-up" style={{ padding: "28px 22px", maxWidth: "400px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "24px" }}>
        <div className="file-icon-wrap">
          <LockIcon />
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: "16px", color: "var(--text)" }}>
            Password required
          </p>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-2)",
              marginTop: "4px",
              wordBreak: "break-all",
            }}
          >
            {filename}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          className="warp-input"
          disabled={loading}
          autoFocus
        />

        {error && (
          <p style={{ fontSize: "13px", color: "var(--error)" }}>{error}</p>
        )}

        <button type="submit" disabled={!password || loading} className="btn-primary">
          {loading ? (
            <>
              <SpinnerIcon />
              Verifying...
            </>
          ) : (
            <>
              <UnlockIcon />
              Access File
            </>
          )}
        </button>
      </form>
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function UnlockIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
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
