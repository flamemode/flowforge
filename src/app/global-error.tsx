"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>
            Something went wrong
          </h1>
          <p style={{ marginTop: "1rem", color: "#71717a" }}>
            A critical error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "2rem",
              padding: "0.75rem 1.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#fff",
              backgroundColor: "#09090b",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
