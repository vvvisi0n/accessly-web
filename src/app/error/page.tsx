"use client";

export default function ErrorPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "1.5rem" }}>
      <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#dc2626", marginBottom: "1rem" }}>
        Something went wrong
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
        An unexpected error occurred. Please try refreshing the page.
      </p>
      <button
        onClick={() => window.location.href = "/"}
        style={{ background: "#1B6EF3", color: "white", padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "none", cursor: "pointer" }}
      >
        Back to home
      </button>
    </div>
  );
}
