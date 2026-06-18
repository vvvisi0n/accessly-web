import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ScoreRing, { scoreColor, scoreLabel } from "@/components/ui/ScoreRing";
import type { CheckpointKey } from "@/types";

// ── Checkpoint icons (exact SVG paths from accessana-venue-page.html) ─────
const CHECKPOINT_ICONS: Record<CheckpointKey, React.ReactNode> = {
  entrance: (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path
        d="M8 38 L18 18 C19.5 15 22.5 15 24 18 L30 30"
        stroke="#1B6EF3"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M13 30 L25 30" stroke="#1B6EF3" strokeWidth="3.6" strokeLinecap="round" />
      <path
        d="M30 30 L40 30 L40 38 L8 38"
        stroke="#1B6EF3"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  ),
  bathrooms: (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <rect
        x="9"
        y="9"
        width="30"
        height="30"
        rx="6"
        stroke="#1B6EF3"
        strokeWidth="3"
        fill="none"
      />
      <path
        d="M24 16 C29 16 32 19 32 24 C32 29 29 32 24 32 C19 32 16 29 16 24"
        stroke="#1B6EF3"
        strokeWidth="3.4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="16" cy="24" r="2.6" fill="#1B6EF3" />
    </svg>
  ),
  parking: (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path
        d="M8 32 L8 20 C8 17 10 15 13 15 L29 15 C32 15 34 17 34 20 L34 32"
        stroke="#1B6EF3"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M8 32 L40 32" stroke="#1B6EF3" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="16" cy="36" r="2.6" fill="#1B6EF3" />
      <circle cx="32" cy="36" r="2.6" fill="#1B6EF3" />
    </svg>
  ),
  staff: (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <circle cx="15" cy="13" r="5" stroke="#1B6EF3" strokeWidth="3" />
      <path
        d="M15 19 C9 19 8 26 8 30"
        stroke="#1B6EF3"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M22 26 L28 32 L36 18"
        stroke="#1B6EF3"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  ),
  sensory: (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path
        d="M10 30 C10 18 17 11 24 11 C31 11 38 18 38 30"
        stroke="#1B6EF3"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M14 30 C14 21 18 16 24 16 C30 16 34 21 34 30"
        stroke="#1B6EF3"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
      />
      <circle cx="24" cy="34" r="2.8" fill="#1B6EF3" />
    </svg>
  ),
};

const CHECKPOINTS: CheckpointKey[] = ["entrance", "bathrooms", "parking", "staff", "sensory"];

async function getVenue(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("venues").select("*").eq("id", id).single();
  return data;
}

async function getReviews(venueId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*, users(display_name, reputation_score)")
    .eq("venue_id", venueId)
    .order("created_at", { ascending: false })
    .limit(20);
  return data ?? [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const venue = await getVenue(id);
  if (!venue) return {};

  const title = `${venue.name} · Accessibility`;
  const description =
    [
      `Accessibility review for ${venue.name}`,
      venue.city ? `in ${venue.city}` : null,
      venue.access_index !== null
        ? `Access Index: ${venue.access_index}/100 (${venue.review_count} reviews)`
        : "Be the first to review this venue",
    ]
      .filter(Boolean)
      .join(" — ") + ".";

  const image = venue.photos?.[0] ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function VenuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [venue, reviews] = await Promise.all([getVenue(id), getReviews(id)]);
  if (!venue) notFound();

  const score = venue.access_index as number | null;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        fontFamily: "var(--font-body)",
        paddingBottom: "5rem",
      }}
    >
      {/* ── Back nav ── */}
      <div style={{ padding: "1rem 1.25rem 0", display: "flex", alignItems: "center", gap: 12 }}>
        <Link
          href="/search"
          style={{
            fontSize: "0.82rem",
            color: "var(--blue)",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          ← Search
        </Link>
      </div>

      {/* ── Hero photo ── */}
      <div
        style={{
          height: 200,
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
        {venue.photos?.[0] ? (
          <img
            src={venue.photos[0]}
            alt={venue.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          "🏛️"
        )}
      </div>

      {/* ── Title block ── */}
      <div style={{ padding: "1.25rem 1.25rem 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: "var(--radius-pill)",
              background: "var(--blue-soft)",
              color: "var(--blue)",
            }}
          >
            {venue.category?.replace(/_/g, " ")}
          </span>
          {venue.certified && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "var(--blue)",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 48 48" fill="none">
                <path
                  d="M24 6 L40 12 L40 24 C40 33 24 42 24 42 C24 42 8 33 8 24 L8 12 Z"
                  stroke="#1B6EF3"
                  strokeWidth="4"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M17 24 L22 29 L31 18"
                  stroke="#1B6EF3"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
              Certified
            </span>
          )}
        </div>

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
          {venue.name}
        </h1>

        {venue.address && (
          <p style={{ fontSize: "0.82rem", color: "var(--ink-3)", marginBottom: "1.25rem" }}>
            📍 {venue.address}
            {venue.city ? `, ${venue.city}` : ""}
          </p>
        )}

        {/* ── Access Index summary ── */}
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
            <div
              style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--ink)", marginBottom: 2 }}
            >
              Based on {venue.review_count} review{venue.review_count !== 1 ? "s" : ""}
            </div>
            <div style={{ fontSize: "0.74rem", color: "var(--ink-3)", lineHeight: 1.4 }}>
              {score === null
                ? "Be the first to review this venue"
                : "Scored across entrance, bathrooms, parking, staff, and sensory"}
            </div>
          </div>
        </div>

        {/* ── Action row ── */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: "1.5rem",
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          <Link
            href={`/review/${venue.id}`}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              background: "var(--blue)",
              color: "#fff",
              textDecoration: "none",
              flexShrink: 0,
              minWidth: 72,
              fontSize: "0.72rem",
              fontWeight: 700,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
              <path
                d="M24 6 L40 12 L40 24 C40 33 24 42 24 42 C24 42 8 33 8 24 L8 12 Z"
                stroke="white"
                strokeWidth="3"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M17 24 L22 29 L31 18"
                stroke="white"
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            Write review
          </Link>
          {["Report change", "Share"].map((label) => (
            <button
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                border: "1.5px solid var(--border)",
                background: "var(--bg)",
                color: "var(--ink-2)",
                cursor: "pointer",
                flexShrink: 0,
                minWidth: 72,
                fontSize: "0.72rem",
                fontWeight: 700,
                fontFamily: "var(--font-body)",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>{label === "Share" ? "↑" : "⚑"}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Subscore breakdown ── */}
      <div style={{ padding: "0 1.25rem", marginBottom: "1.75rem" }}>
        <h2
          style={{
            fontSize: "0.88rem",
            fontWeight: 800,
            color: "var(--ink)",
            marginBottom: "1rem",
          }}
        >
          Accessibility breakdown
        </h2>
        {CHECKPOINTS.map((cp) => {
          const raw = venue[`score_${cp}` as keyof typeof venue] as number | null;
          const pct = raw === null ? null : Math.round(raw * 10) / 10;
          const barColor =
            pct === null
              ? "var(--score-grey)"
              : pct >= 75
                ? "var(--score-green)"
                : pct >= 50
                  ? "var(--score-amber)"
                  : "var(--score-red)";
          return (
            <div
              key={cp}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.875rem",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "var(--blue-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {CHECKPOINT_ICONS[cp]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "var(--ink)",
                      textTransform: "capitalize" as const,
                    }}
                  >
                    {cp}
                  </span>
                  <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--ink)" }}>
                    {pct ?? "—"}
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    background: "var(--border)",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct ?? 0}%`,
                      background: barColor,
                      borderRadius: 4,
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Reviews ── */}
      <div style={{ padding: "0 1.25rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <h2 style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--ink)" }}>
            Reviews ({reviews.length})
          </h2>
          <Link
            href={`/review/${venue.id}`}
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "var(--blue)",
              textDecoration: "none",
            }}
          >
            + Write one
          </Link>
        </div>

        {reviews.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "2rem 1rem",
              background: "var(--surface)",
              borderRadius: "var(--radius)",
              color: "var(--ink-3)",
            }}
          >
            <p style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>✍️</p>
            <p style={{ fontSize: "0.88rem", fontWeight: 600, marginBottom: 4 }}>No reviews yet</p>
            <p style={{ fontSize: "0.78rem" }}>
              Be the first to review this venue&apos;s accessibility.
            </p>
          </div>
        )}

        {reviews.map((r: Record<string, unknown>) => {
          const id = r.id as string;
          const comment = r.overall_comment as string | null;
          const date = r.visit_date as string | null;
          const types = (r.disability_types as string[]) ?? [];
          return (
            <div key={id} style={{ padding: "1rem 0", borderBottom: "1px solid var(--border)" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: "var(--blue-soft)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      color: "var(--blue)",
                    }}
                  >
                    {(
                      (r.users as { display_name?: string } | null)?.display_name?.[0] ?? "?"
                    ).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--ink)" }}>
                      {(r.users as { display_name?: string } | null)?.display_name ?? "Anonymous"}
                    </div>
                    {date && (
                      <div style={{ fontSize: "0.68rem", color: "var(--ink-3)" }}>{date}</div>
                    )}
                  </div>
                </div>
              </div>
              {types.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap" as const,
                    marginBottom: "0.5rem",
                  }}
                >
                  {types.map((t: string) => (
                    <span
                      key={t}
                      style={{
                        fontSize: "0.64rem",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "var(--radius-pill)",
                        background: "var(--blue-soft)",
                        color: "var(--blue)",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {comment && (
                <p style={{ fontSize: "0.84rem", color: "var(--ink-2)", lineHeight: 1.6 }}>
                  {comment}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Sticky review CTA ── */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "1rem 1.25rem",
          background: "var(--bg)",
          borderTop: "1px solid var(--border)",
          display: "flex",
          gap: 10,
          zIndex: 40,
        }}
      >
        <Link
          href={`/review/${venue.id}`}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--blue)",
            color: "#fff",
            padding: 12,
            borderRadius: "var(--radius-sm)",
            fontSize: "0.9rem",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Write a review
        </Link>
      </div>
    </main>
  );
}
