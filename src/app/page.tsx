"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadForm } from "@/components/UploadForm";
import { UploadResult } from "@/components/UploadResult";
import type { UploadResponse } from "@/types";

export default function HomePage() {
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleAccessWarp = (e: { preventDefault(): void }) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (trimmed) {
      router.push(`/${trimmed}`);
    }
  };

  if (result) {
    return (
      <div className="card fade-up" style={{ padding: "28px 22px" }}>
        <UploadResult result={result} onReset={() => setResult(null)} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div className="fade-up" style={{ paddingBottom: "6px" }}>
        <h1
          className="font-display"
          style={{
            fontSize: "3.6rem",
            lineHeight: 0.95,
            color: "var(--text)",
            letterSpacing: "0.01em",
          }}
        >
          SEND A FILE<br />
          <span style={{ color: "var(--accent)" }}>BEFORE IT VANISHES</span>
        </h1>
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-2)",
            marginTop: "10px",
            fontWeight: 500,
          }}
        >
          Encrypted · Temporary · No account needed
        </p>
      </div>

      <div className="card fade-up-delay-1" style={{ padding: "22px" }}>
        <UploadForm onUploadComplete={setResult} />
      </div>

      <div className="card fade-up-delay-2" style={{ padding: "18px 22px" }}>
        <p className="field-label">Have a warp code?</p>
        <form onSubmit={handleAccessWarp} style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="XXXXXXXX"
            className="warp-input font-mono"
            style={{ letterSpacing: "0.2em", fontSize: "16px" }}
            maxLength={12}
          />
          <button
            type="submit"
            disabled={!code.trim()}
            className="btn-primary"
            style={{ width: "auto", padding: "13px 18px", flexShrink: 0 }}
          >
            <ArrowRightIcon />
          </button>
        </form>
      </div>
    </div>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
