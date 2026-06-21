"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getCachedVenue, type VenueCacheEntry } from "@/lib/offline/db";
import ScoreRing, { scoreColor, scoreLabel } from "@/components/ui/ScoreRing";

export default function OfflinePage() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "";

  // Extract venue ID from /venue/[id] paths
  const venueId = from.match(/^\/venue\/([^/?]+)/)?.[1] ?? null;

  const [venue, setVenue] = useState<VenueCacheEntry | null>(null);
  const [loading, setLoading] = useState(!!venueId);

  useEffect(() => {
    if (!venueId) { setLoading(false); return; }
    getCachedVenue(venueId)
      .then((v) => setVenue(v ?? null))
      .catch(() => setVenue(null))
      .finally(() => setLoading(false));
  }, [venueId]);

  // ── Generic offline shell ─────────────────────────────────
  if (!venueId || (!loading && !venue)) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          fontFamily: "var(--font-body)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1.25rem",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📡</div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "var(--ink)",
            marginBottom: "0.5rem",
          }}
        >
          You&apos;re offline
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--ink-3)", maxWidth: 300, lineHeight: 1.6 }}>
          {venueId
            ? "This venue hasn't been cached yet. Visit it while online to save it for offline use."
            : "This page isn't available offline. Check your connection and try again."}
        </p>
        <Link
          href="/"
          style={{
            marginTop: "1.5rem",
            fontSize: "0.88rem",
            fontWeight: 700,
            color: "var(--blue)",
            textDecoration: "none",
          }}
        >
          ← Back to home
        </Link>
      </main>
    );
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontSize: "0.88rem", color: "var(--ink-3)" }}>Loading cached data…</div>
      </main>
    );
  }

  // ── Cached venue display ──────────────────────────────────
  const score = venue!.access_index;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        fontFamily: "var(--font-body)",
        paddingBottom: "3rem",
      }}
    >
      {/* Offline notice */}
      <div
        style={{
          background: "#fef3c7",
          borderBottom: "1px solid #fde68a",
          padding: "10px 1.25rem",
          fontSize: "0.78rem",
          fontWeight: 600,
          color: "#92400e",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span>📡</span>
        Offline. Showing last cached data.
      </div>

      <div style={{ padding: "1rem 1.25rem 0", display: "flex", alignItems: "center", gap: 12 }}>
        <Link
          href="/"
          style={{ fontSize: "0.82rem", color: "var(--blue)", textDecoration: "none", fontWeight: 600 }}
        >
          ← Home
        </Link>
      </div>

      {/* Hero photo */}
      <div
        style={{
          height: 180,
          background: "var(--surface)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "3rem",
          margin: "1rem 1.25rem 0",
          borderRadius: "var(--radius)",
          overflow: "hidden",
        }}
      >
        {venue!.photos?.[0] ? (
          <img
            src={venue!.photos[0]}
            alt={venue!.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          "🏛️"
        )}
      </div>

      <div style={{ padding: "1.25rem 1.25rem 0" }}>
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: "var(--radius-pill)",
            background: "var(--blue-soft)",
            color: "var(--blue)",
            display: "inline-block",
            marginBottom: "0.5rem",
          }}
        >
          {venue!.category?.replace(/_/g, " ")}
        </span>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.7rem",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            color: "var(--ink)",
            marginBottom: "0.25rem",
            lineHeight: 1.2,
          }}
        >
          {venue!.name}
        </h1>

        {venue!.address && (
          <p style={{ fontSize: "0.82rem", color: "var(--ink-3)", marginBottom: "1.25rem" }}>
            📍 {venue!.address}
            {venue!.city ? `, ${venue!.city}` : ""}
          </p>
        )}

        {/* Access Index */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            background: "var(--surface)",
            borderRadius: "var(--radius)",
            padding: "1rem",
            marginBottom: "1.25rem",
          }}
        >
          <ScoreRing score={score} size="lg" />
          <div>
            <div
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                textTransform: "uppercase" as const,
                letterSpacing: "0.05em",
                color: scoreColor(score),
                marginBottom: 3,
              }}
            >
              {scoreLabel(score)}
            </div>
            <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--ink)", marginBottom: 2 }}>
              Based on {venue!.review_count} review{venue!.review_count !== 1 ? "s" : ""}
            </div>
            <div style={{ fontSize: "0.74rem", color: "var(--ink-3)" }}>
              {score === null
                ? "No reviews yet"
                : "Scored across entrance, bathrooms, parking, staff, and sensory"}
            </div>
          </div>
        </div>

        {/* Sub-scores */}
        {(["entrance", "bathrooms", "parking", "staff", "sensory"] as const).map((cp) => {
          const raw = venue![`score_${cp}` as keyof VenueCacheEntry] as number | null;
          const pct = raw === null ? null : Math.round((raw as number) * 10) / 10;
          const barColor =
            pct === null ? "var(--score-grey)"
            : pct >= 75 ? "var(--score-green)"
            : pct >= 50 ? "var(--score-amber)"
            : "var(--score-red)";
          return (
            <div
              key={cp}
              style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.875rem" }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--ink)", textTransform: "capitalize" as const }}>
                    {cp}
                  </span>
                  <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--ink)" }}>
                    {pct ?? "-"}
                  </span>
                </div>
                <div style={{ height: 6, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${pct ?? 0}%`,
                      background: barColor,
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}

        <p style={{ fontSize: "0.72rem", color: "var(--ink-3)", marginTop: "0.5rem" }}>
          Cached {new Date(venue!.cachedAt).toLocaleDateString()}
        </p>
      </div>
    </main>
  );
}
