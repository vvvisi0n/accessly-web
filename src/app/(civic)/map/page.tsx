"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { CivicReport, CivicReportType, CivicStatus } from "@/types";

// ── Filter config ─────────────────────────────────────────────────────────
const STATUS_FILTERS: { value: CivicStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
];

const TYPE_FILTERS: { value: CivicReportType | "all"; label: string; emoji: string }[] = [
  { value: "all", label: "All types", emoji: "📍" },
  { value: "broken_sidewalk", label: "Sidewalk", emoji: "🚧" },
  { value: "missing_curb_cut", label: "Curb cut", emoji: "⬛" },
  { value: "blocked_ramp", label: "Ramp", emoji: "🚫" },
  { value: "broken_elevator", label: "Elevator", emoji: "🛗" },
  { value: "inaccessible_crossing", label: "Crossing", emoji: "🚦" },
];

const STATUS_COLOR: Record<CivicStatus, string> = {
  open: "var(--civic)",
  in_progress: "var(--score-amber)",
  resolved: "var(--score-green)",
  closed: "var(--score-grey)",
};

// Mock leaderboard data (replaced by real Supabase query once migration runs)
const LEADERBOARD = [
  { rank: 1, city: "Portland, OR", days: "4 days avg" },
  { rank: 2, city: "Austin, TX", days: "6 days avg" },
  { rank: 3, city: "New York, NY", days: "12 days avg" },
  { rank: 4, city: "Denver, CO", days: "14 days avg" },
  { rank: 5, city: "Seattle, WA", days: "18 days avg" },
];

export default function CivicMapPage() {
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<CivicStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<CivicReportType | "all">("all");
  const [selected, setSelected] = useState<CivicReport | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    fetch("/api/civic?limit=100")
      .then((r) => (r.ok ? r.json() : { reports: [] }))
      .then((d) => {
        setReports(d?.reports ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = reports.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (typeFilter !== "all" && r.report_type !== typeFilter) return false;
    return true;
  });

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
        fontFamily: "var(--font-body)",
        color: "var(--civic)",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          flexShrink: 0,
          background: "var(--bg)",
          borderBottom: "1px solid var(--border)",
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 16px 8px",
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              color: "var(--ink)",
              textDecoration: "none",
            }}
          >
            access<span style={{ color: "var(--blue)" }}>ana</span>
          </Link>
          <h1 style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--ink)" }}>Civic map</h1>
          <button
            onClick={() => setShowLeaderboard((v) => !v)}
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "var(--civic)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
            }}
          >
            🏆 Rankings
          </button>
        </div>

        {/* Status filter row */}
        <div
          style={{
            display: "flex",
            gap: 6,
            padding: "0 16px 8px",
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          {STATUS_FILTERS.map(({ value, label }) => {
            const active = statusFilter === value;
            return (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                aria-pressed={active}
                style={{
                  padding: "5px 12px",
                  borderRadius: "var(--radius-pill)",
                  border: "1.5px solid",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  flexShrink: 0,
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                  borderColor: active ? "var(--civic)" : "var(--border)",
                  background: active ? "var(--civic)" : "var(--bg)",
                  color: active ? "#fff" : "var(--ink-2)",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Type filter row */}
        <div
          style={{
            display: "flex",
            gap: 6,
            padding: "0 16px 10px",
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          {TYPE_FILTERS.map(({ value, label, emoji }) => {
            const active = typeFilter === value;
            return (
              <button
                key={value}
                onClick={() => setTypeFilter(value)}
                aria-pressed={active}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "5px 12px",
                  borderRadius: "var(--radius-pill)",
                  border: "1.5px solid",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  flexShrink: 0,
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                  borderColor: active ? "var(--civic)" : "var(--border)",
                  background: active ? "#FDECEA" : "var(--bg)",
                  color: active ? "var(--civic)" : "var(--ink-2)",
                }}
              >
                {emoji} {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Map area ── */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* Map placeholder (live Mapbox replaces this once token is set) */}
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#e8efe8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 8,
            color: "var(--ink-3)",
          }}
        >
          {loading ? (
            <p style={{ fontSize: "0.88rem", fontWeight: 600 }}>Loading reports…</p>
          ) : filtered.length === 0 ? (
            <>
              <span style={{ fontSize: "2rem" }}>🗺️</span>
              <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>No reports found</p>
              <p style={{ fontSize: "0.78rem", textAlign: "center", maxWidth: 220 }}>
                Adjust filters or be the first to report an issue in your city.
              </p>
            </>
          ) : (
            <>
              <span style={{ fontSize: "2rem" }}>🗺️</span>
              <p style={{ fontSize: "0.88rem", fontWeight: 600 }}>
                {filtered.length} report{filtered.length !== 1 ? "s" : ""} in view
              </p>
              <p style={{ fontSize: "0.78rem", textAlign: "center", maxWidth: 260 }}>
                Add your <code style={{ fontSize: "0.72rem" }}>NEXT_PUBLIC_MAPBOX_TOKEN</code> to
                enable the live map.
              </p>
            </>
          )}
        </div>

        {/* Report list over map for non-Mapbox fallback */}
        {filtered.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              right: 8,
              maxHeight: "40%",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {filtered.slice(0, 5).map((r) => (
              <button
                key={r.id}
                onClick={() => setSelected(r)}
                style={{
                  background: "var(--bg)",
                  border: "1.5px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 12px",
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: STATUS_COLOR[r.status],
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "var(--ink)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.report_type.replace(/_/g, " ")}
                  </div>
                  {r.city && (
                    <div style={{ fontSize: "0.68rem", color: "var(--ink-3)" }}>{r.city}</div>
                  )}
                </div>
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "var(--radius-pill)",
                    background:
                      r.status === "open"
                        ? "#FDECEA"
                        : r.status === "resolved"
                          ? "#E6F7F1"
                          : "var(--surface)",
                    color: STATUS_COLOR[r.status],
                  }}
                >
                  {r.status.replace(/_/g, " ")}
                </span>
              </button>
            ))}
            {filtered.length > 5 && (
              <p
                style={{
                  textAlign: "center",
                  fontSize: "0.72rem",
                  color: "var(--ink-3)",
                  padding: "4px 0",
                }}
              >
                +{filtered.length - 5} more reports
              </p>
            )}
          </div>
        )}

        {/* ── Selected report detail ── */}
        {selected && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "var(--bg)",
              borderRadius: "22px 22px 0 0",
              boxShadow: "0 -8px 24px rgba(0,0,0,0.12)",
              padding: "16px 18px 24px",
              zIndex: 20,
            }}
          >
            <div
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                background: "var(--border)",
                margin: "0 auto 14px",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <h3
                style={{
                  fontSize: "0.92rem",
                  fontWeight: 800,
                  color: "var(--ink)",
                  textTransform: "capitalize" as const,
                }}
              >
                {selected.report_type.replace(/_/g, " ")}
              </h3>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--ink-3)",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                }}
              >
                ✕
              </button>
            </div>
            {selected.city && (
              <p style={{ fontSize: "0.78rem", color: "var(--ink-3)", marginBottom: "0.5rem" }}>
                📍 {selected.address ? `${selected.address}, ` : ""}
                {selected.city}
              </p>
            )}
            {selected.description && (
              <p
                style={{
                  fontSize: "0.84rem",
                  color: "var(--ink-2)",
                  lineHeight: 1.55,
                  marginBottom: "0.75rem",
                }}
              >
                {selected.description}
              </p>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: "var(--radius-pill)",
                  background: selected.status === "open" ? "#FDECEA" : "#E6F7F1",
                  color: STATUS_COLOR[selected.status],
                }}
              >
                {selected.status.replace(/_/g, " ")}
              </span>
              <span style={{ fontSize: "0.72rem", color: "var(--ink-3)" }}>
                {selected.upvote_count} upvote{selected.upvote_count !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )}

        {/* ── Leaderboard bottom sheet ── */}
        {showLeaderboard && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "var(--bg)",
              borderRadius: "22px 22px 0 0",
              boxShadow: "0 -8px 24px rgba(0,0,0,0.12)",
              padding: "16px 18px 28px",
              zIndex: 25,
            }}
          >
            <div
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                background: "var(--border)",
                margin: "0 auto 14px",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: "0.84rem", fontWeight: 800, color: "var(--ink)" }}>
                🏆 Fastest cities this month
              </span>
              <button
                onClick={() => setShowLeaderboard(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--ink-3)",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                }}
              >
                ✕
              </button>
            </div>
            {LEADERBOARD.map(({ rank, city, days }) => (
              <div
                key={rank}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "7px 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span
                  style={{
                    width: 22,
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    color: rank <= 3 ? "var(--score-green)" : "var(--ink-3)",
                    flexShrink: 0,
                  }}
                >
                  {rank}
                </span>
                <span
                  style={{ flex: 1, fontSize: "0.84rem", fontWeight: 600, color: "var(--ink)" }}
                >
                  {city}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--ink-3)", fontWeight: 600 }}>
                  {days}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Report FAB ── */}
        <Link
          href="/report"
          aria-label="Submit a new civic report"
          style={{
            position: "absolute",
            bottom: 90,
            right: 18,
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--civic)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.4rem",
            textDecoration: "none",
            boxShadow: "0 8px 20px rgba(220,38,38,0.4)",
            zIndex: 15,
          }}
        >
          ⚑
        </Link>
      </div>
    </div>
  );
}
