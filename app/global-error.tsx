"use client";

import { useEffect } from "react";

const GlobalError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <style>{`
          :root { color-scheme: light dark; --ge-bg:#fafafa; --ge-fg:#161616; --ge-muted:#525252; }
          @media (prefers-color-scheme: dark) {
            :root { --ge-bg:#0a0a0a; --ge-fg:#fafafa; --ge-muted:#a3a3a3; }
          }
        `}</style>
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          background: "var(--ge-bg)",
          color: "var(--ge-fg)",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <div style={{ width: "100%", maxWidth: "24rem", textAlign: "center" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "1.25rem",
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              margin: "0.75rem 0 1.25rem",
              fontSize: "0.875rem",
              lineHeight: 1.6,
              color: "var(--ge-muted)",
            }}
          >
            FixItNow failed to load. Please try again, or reload the page if the
            problem continues.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              width: "100%",
              cursor: "pointer",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.625rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              background: "#e9712b",
              color: "#ffffff",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
};

export default GlobalError;
