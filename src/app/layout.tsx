import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "WARP — Ephemeral Files",
  description: "Send files before they vanish. Encrypted, temporary, no account needed.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
          <header
            style={{
              position: "sticky",
              top: 0,
              zIndex: 50,
              height: "56px",
              padding: "0 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(4, 4, 8, 0.88)",
              backdropFilter: "blur(14px)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <Link
              href="/"
              style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}
            >
              <WarpIcon />
              <span
                className="font-display"
                style={{
                  fontSize: "1.45rem",
                  letterSpacing: "0.1em",
                  color: "var(--accent)",
                  lineHeight: 1,
                }}
              >
                WARP
              </span>
            </Link>
            <span
              style={{
                fontSize: "10px",
                color: "var(--text-2)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Ephemeral Files
            </span>
          </header>

          <main
            style={{
              flex: 1,
              width: "100%",
              maxWidth: "480px",
              margin: "0 auto",
              padding: "28px 16px 52px",
            }}
          >
            {children}
          </main>

          <footer
            style={{
              padding: "16px 20px",
              textAlign: "center",
              borderTop: "1px solid var(--border)",
              fontSize: "11px",
              color: "var(--text-2)",
              letterSpacing: "0.06em",
            }}
          >
            © {new Date().getFullYear()} WARP — Files that vanish.
          </footer>
        </div>
      </body>
    </html>
  );
}

function WarpIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#161622"
        d="M0 29a4 4 0 0 0 4 4h24a4 4 0 0 0 4-4V12a4 4 0 0 0-4-4h-9c-3.562 0-3-5-8.438-5H4a4 4 0 0 0-4 4v22z"
      />
      <path
        fill="#CAFF45"
        d="M30 10h-6.562C18 10 18.562 15 15 15H6a4 4 0 0 0-4 4v10a1 1 0 1 1-2 0a4 4 0 0 0 4 4h26a4 4 0 0 0 4-4V14a4 4 0 0 0-4-4z"
      />
    </svg>
  );
}
