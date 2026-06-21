"use client";

import Link from "next/link";
import { useOfflineStatus } from "@/hooks/useOfflineQueue";

export default function Navbar() {
  const { isOnline, pendingCount } = useOfflineStatus();

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--bg)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.25rem",
        height: 52,
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.1rem",
          fontWeight: 600,
          color: "var(--ink)",
          textDecoration: "none",
          letterSpacing: "-0.02em",
        }}
      >
        Accessana
      </Link>

      {/* Right side: offline status + pending badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Offline indicator dot */}
        {!isOnline && (
          <div
            title="You're offline"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "#6b7280",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#9ca3af",
                display: "inline-block",
              }}
            />
            Offline
          </div>
        )}

        {/* Pending submissions badge */}
        {pendingCount > 0 && (
          <div
            title={`${pendingCount} submission${pendingCount !== 1 ? "s" : ""} pending sync`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "#b45309",
              background: "#fef3c7",
              padding: "3px 8px",
              borderRadius: 20,
              border: "1px solid #fde68a",
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4v8l4 4"
                stroke="#b45309"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="10" stroke="#b45309" strokeWidth="2" />
            </svg>
            {pendingCount} pending
          </div>
        )}

        {/* Nav links */}
        <Link
          href="/search"
          style={{
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "var(--ink-2)",
            textDecoration: "none",
          }}
        >
          Search
        </Link>
        <Link
          href="/profile"
          style={{
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "var(--ink-2)",
            textDecoration: "none",
          }}
        >
          Profile
        </Link>
      </div>
    </nav>
  );
}
