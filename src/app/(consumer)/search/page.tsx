"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ScoreRing, scoreColor, scoreLabel } from "@/components/ui";
import type { Venue, VenueCategory, DisabilityType } from "@/types";
import { useGeolocation } from "@/hooks/useGeolocation";
import { calculateDistanceMiles, formatDistanceMiles } from "@/lib/utils/distance";

// ── Disability filter chips ───────────────────────────────────────────────
const DISABILITY_CHIPS: { type: DisabilityType; emoji: string; label: string }[] = [
  { type: "mobility", emoji: "🦽", label: "Mobility" },
  { type: "vision", emoji: "👁️", label: "Vision" },
  { type: "hearing", emoji: "👂", label: "Hearing" },
  { type: "cognitive", emoji: "🧠", label: "Cognitive" },
  { type: "sensory", emoji: "🌟", label: "Sensory" },
];

const CATEGORIES: { value: VenueCategory; label: string }[] = [
  { value: "restaurant", label: "Restaurant" },
  { value: "cafe", label: "Café" },
  { value: "hotel", label: "Hotel" },
  { value: "hospital", label: "Hospital" },
  { value: "clinic", label: "Clinic" },
  { value: "park", label: "Park" },
  { value: "museum", label: "Museum" },
  { value: "shopping", label: "Shopping" },
  { value: "transit_stop", label: "Transit" },
  { value: "gym", label: "Gym" },
];

// ── Venue card ────────────────────────────────────────────────────────────
function VenueListCard({
  venue,
  distanceMiles,
}: {
  venue: Venue;
  distanceMiles: number | null;
}) {
  const score = venue.access_index;
  return (
    <Link
      href={`/venue/${venue.id}`}
      style={{
        display: "flex",
        background: "var(--bg)",
        border: "1.5px solid var(--border)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        transition: "border-color 0.15s",
      }}
    >
      {/* Photo thumb */}
      <div
        style={{
          width: 80,
          flexShrink: 0,
          background: "var(--surface)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.6rem",
        }}
      >
        {venue.photos?.[0] ? (
          <img
            src={venue.photos[0]}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          "🏛️"
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "0.875rem 1rem", flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "0.88rem",
            fontWeight: 700,
            color: "var(--ink)",
            marginBottom: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {venue.name}
        </div>
        <div style={{ fontSize: "0.74rem", color: "var(--ink-3)", marginBottom: "0.5rem" }}>
          {venue.category?.replace(/_/g, " ")}
          {venue.city ? ` · ${venue.city}` : ""}
          {distanceMiles !== null ? (
            <span style={{ marginLeft: 6, color: "var(--blue)", fontWeight: 600 }}>
              {formatDistanceMiles(distanceMiles)}
            </span>
          ) : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ScoreRing score={score} size="sm" />
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: scoreColor(score) }}>
              {scoreLabel(score)}
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--ink-3)" }}>
              {venue.review_count} review{venue.review_count !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function SearchPage() {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [city, setCity] = useState(params.get("city") ?? "");
  const [activeTypes, setActiveTypes] = useState<DisabilityType[]>([]);
  const [activeCategory, setActiveCategory] = useState<VenueCategory | "">("");
  const [minScore, setMinScore] = useState(0);
  const [view, setView] = useState<"list" | "map">("list");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);

  const geo = useGeolocation();

  // True when we have no way to infer location and the user hasn't given us one.
  const hasFilters = !!(query || city || activeCategory || minScore > 0);
  const noLocationContext =
    (geo.status === "denied" || geo.status === "unavailable") && !hasFilters;

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    const sp = new URLSearchParams();
    if (query) sp.set("q", query);
    if (city) sp.set("city", city);
    if (activeCategory) sp.set("category", activeCategory);
    if (minScore > 0) sp.set("minScore", String(minScore));
    sp.set("limit", "40");

    const res = await fetch(`/api/venues?${sp.toString()}`).catch(() => null);
    const data = res?.ok ? await res.json().catch(() => ({})) : {};
    setVenues(data?.venues ?? []);
    setLoading(false);
  }, [query, city, activeCategory, minScore]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  function toggleType(t: DisabilityType) {
    setActiveTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  // Disability-type client filter applied here once reviews carry type data.
  const filtered = activeTypes.length === 0 ? venues : venues.filter(() => true);

  const activeFilterCount =
    (activeTypes.length > 0 ? 1 : 0) + (activeCategory ? 1 : 0) + (minScore > 0 ? 1 : 0);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          padding: "10px 16px 0",
          background: "var(--bg)",
          borderBottom: "1px solid var(--border)",
          zIndex: 20,
          flexShrink: 0,
        }}
      >
        {/* Search inputs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              color: "var(--ink)",
              textDecoration: "none",
              flexShrink: 0,
              paddingRight: 4,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1rem",
                fontWeight: 600,
                color: "var(--ink)",
              }}
            >
              access<span style={{ color: "var(--blue)" }}>ana</span>
            </span>
          </Link>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchVenues()}
            placeholder="Search venues..."
            aria-label="Search venues by name"
            style={{
              flex: 1,
              padding: "9px 14px",
              borderRadius: "var(--radius-pill)",
              border: "1.5px solid var(--border)",
              fontSize: "0.88rem",
              color: "var(--ink)",
              fontFamily: "var(--font-body)",
              outline: "none",
              background: "var(--surface)",
            }}
          />
          <button
            onClick={() => setView((v) => (v === "list" ? "map" : "list"))}
            style={{
              padding: "8px 14px",
              borderRadius: "var(--radius-pill)",
              border: "1.5px solid var(--border)",
              background: view === "map" ? "var(--blue)" : "var(--surface)",
              color: view === "map" ? "#fff" : "var(--ink-2)",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              whiteSpace: "nowrap",
            }}
          >
            {view === "map" ? "List" : "Map"}
          </button>
        </div>
        {/* City filter — highlighted when we have no location context */}
        <div style={{ marginBottom: 8 }}>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchVenues()}
            placeholder={noLocationContext ? "Enter a city to find venues near you..." : "Filter by city..."}
            aria-label="Filter by city"
            style={{
              width: "100%",
              padding: "7px 14px",
              borderRadius: "var(--radius-pill)",
              border: noLocationContext ? "1.5px solid var(--blue)" : "1.5px solid var(--border)",
              fontSize: "0.82rem",
              color: "var(--ink)",
              fontFamily: "var(--font-body)",
              outline: "none",
              background: noLocationContext ? "var(--blue-soft)" : "var(--surface)",
              boxSizing: "border-box",
              transition: "border-color 0.2s, background 0.2s",
            }}
          />
        </div>

        {/* Filter chips, with overflow collapse from design brief */}
        <div
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            paddingBottom: 10,
            scrollbarWidth: "none",
          }}
        >
          {DISABILITY_CHIPS.map(({ type, emoji, label }) => {
            const active = activeTypes.includes(type);
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "6px 12px",
                  borderRadius: "var(--radius-pill)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  border: "1.5px solid",
                  flexShrink: 0,
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  borderColor: active ? "var(--blue)" : "var(--border)",
                  background: active ? "var(--blue)" : "var(--bg)",
                  color: active ? "#fff" : "var(--ink-2)",
                  transition: "all 0.15s",
                }}
                aria-pressed={active}
              >
                {emoji} {label} {active ? "✕" : ""}
              </button>
            );
          })}

          {/* Category select */}
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value as VenueCategory | "")}
            style={{
              padding: "6px 10px",
              borderRadius: "var(--radius-pill)",
              border: "1.5px solid var(--border)",
              fontSize: "0.72rem",
              fontWeight: 700,
              color: activeCategory ? "var(--blue)" : "var(--ink-3)",
              background: activeCategory ? "var(--blue-soft)" : "var(--bg)",
              fontFamily: "var(--font-body)",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Min score chip */}
          <button
            onClick={() => setMinScore((s) => (s === 0 ? 75 : s === 75 ? 50 : 0))}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 12px",
              borderRadius: "var(--radius-pill)",
              fontSize: "0.72rem",
              fontWeight: 700,
              whiteSpace: "nowrap",
              border: "1.5px solid",
              flexShrink: 0,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              borderColor: minScore > 0 ? "var(--blue)" : "var(--border)",
              background: minScore > 0 ? "var(--blue)" : "var(--bg)",
              color: minScore > 0 ? "#fff" : "var(--ink-2)",
            }}
          >
            {minScore > 0 ? `Score ≥ ${minScore} ✕` : "Min score"}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setActiveTypes([]);
                setActiveCategory("");
                setMinScore(0);
              }}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--radius-pill)",
                border: "1.5px solid var(--border)",
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "var(--ink-3)",
                background: "var(--bg)",
                cursor: "pointer",
                flexShrink: 0,
                fontFamily: "var(--font-body)",
                whiteSpace: "nowrap",
              }}
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
        {view === "list" ? (
          /* List view */
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 20px" }}>
            <p
              style={{
                fontSize: "0.76rem",
                color: "var(--ink-3)",
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              {loading ? (
                "Searching..."
              ) : geo.status === "pending" ? (
                "Finding your location..."
              ) : (
                <>
                  <strong style={{ color: "var(--ink)" }}>
                    {filtered.length} place{filtered.length !== 1 ? "s" : ""}
                  </strong>
                  {query ? ` matching "${query}"` : ""}
                  {city ? ` in ${city}` : ""}
                  {geo.status === "granted" && !query && !city ? " near you" : ""}
                </>
              )}
            </p>

            {!loading && filtered.length === 0 && noLocationContext && (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--ink-3)" }}>
                <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📍</p>
                <p
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: "var(--ink)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Where should we look?
                </p>
                <p style={{ fontSize: "0.82rem", maxWidth: 280, margin: "0 auto 1rem" }}>
                  Location access was denied. Type a city above to find accessible venues near you.
                </p>
              </div>
            )}

            {!loading && filtered.length === 0 && !noLocationContext && (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--ink-3)" }}>
                <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔍</p>
                <p style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                  No venues found
                </p>
                <p style={{ fontSize: "0.82rem" }}>Try a different search term or adjust your filters.</p>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.map((v) => {
                const distanceMiles =
                  geo.status === "granted" &&
                  geo.lat !== null &&
                  geo.lng !== null &&
                  v.lat !== null &&
                  v.lng !== null
                    ? calculateDistanceMiles(geo.lat, geo.lng, v.lat!, v.lng!)
                    : null;
                return (
                  <VenueListCard key={v.id} venue={v} distanceMiles={distanceMiles} />
                );
              })}
            </div>
          </div>
        ) : (
          /* Map view placeholder, real Mapbox integration in VenueMap component */
          <div
            style={{
              flex: 1,
              background: "var(--surface)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 12,
              color: "var(--ink-3)",
            }}
          >
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path
                d="M24 6 C15 6 9 13 9 21 C9 30 24 42 24 42 C24 42 39 30 39 21 C39 13 33 6 24 6 Z"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                strokeLinejoin="round"
              />
              <circle cx="24" cy="21" r="5" stroke="currentColor" strokeWidth="2.5" fill="none" />
            </svg>
            <p style={{ fontSize: "0.88rem", fontWeight: 600 }}>Map view</p>
            <p style={{ fontSize: "0.78rem", textAlign: "center", maxWidth: 220 }}>
              Add your <code style={{ fontSize: "0.72rem" }}>NEXT_PUBLIC_MAPBOX_TOKEN</code> to{" "}
              <code style={{ fontSize: "0.72rem" }}>.env.local</code> to enable the map.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
