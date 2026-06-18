"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import type { CivicReportType } from "@/types";

const REPORT_TYPES: { type: CivicReportType; emoji: string; label: string; desc: string }[] = [
  {
    type: "broken_sidewalk",
    emoji: "🚧",
    label: "Broken sidewalk",
    desc: "Cracked, uneven, or dangerous pavement",
  },
  {
    type: "missing_curb_cut",
    emoji: "⬛",
    label: "Missing curb cut",
    desc: "No ramp at a crosswalk or corner",
  },
  {
    type: "blocked_ramp",
    emoji: "🚫",
    label: "Blocked ramp",
    desc: "Ramp obstructed by vehicles or debris",
  },
  {
    type: "broken_elevator",
    emoji: "🛗",
    label: "Broken elevator",
    desc: "Out of service in a public building or transit",
  },
  {
    type: "inaccessible_crossing",
    emoji: "🚦",
    label: "Inaccessible crossing",
    desc: "No audio signal or safe crossing option",
  },
  {
    type: "missing_signage",
    emoji: "⚠️",
    label: "Missing signage",
    desc: "No accessible route or facility signs",
  },
  {
    type: "inaccessible_parking",
    emoji: "🅿️",
    label: "Inaccessible parking",
    desc: "Blocked or absent accessible parking",
  },
  { type: "other", emoji: "📍", label: "Other issue", desc: "Something not listed above" },
];

type Step = "type" | "details" | "confirm";

export default function CivicReportPage() {
  const [step, setStep] = useState<Step>("type");
  const [reportType, setReportType] = useState<CivicReportType | null>(null);
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState<string | null>(null);
  const [routed311, setRouted311] = useState(false);

  async function handleSubmit() {
    if (!reportType || !description.trim()) {
      setError("Please select a report type and describe the issue.");
      return;
    }
    setSubmitting(true);
    setError("");

    // Use a default location — in production this comes from the Mapbox pin.
    // The field is required by the DB so we use a placeholder until Mapbox is wired.
    const res = await fetch("/api/civic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        report_type: reportType,
        description: description.trim(),
        lat: 40.7128, // placeholder — replaced by Mapbox draggable pin (Phase 1)
        lng: -74.006,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.error ?? "Submission failed. Please try again.");
      setSubmitting(false);
      return;
    }

    setReference(data.reference);
    setRouted311(data.routed_to_311 ?? false);
    setStep("confirm");
    setSubmitting(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        fontFamily: "var(--font-body)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          padding: "1rem 1.25rem",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "var(--bg)",
        }}
      >
        <Link
          href="/map"
          style={{
            color: "var(--civic)",
            textDecoration: "none",
            fontSize: "0.88rem",
            fontWeight: 700,
          }}
        >
          ← Map
        </Link>
        <span
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "var(--ink)",
          }}
        >
          Report an issue
        </span>
        <span style={{ fontSize: "0.75rem", color: "var(--ink-3)", fontWeight: 600 }}>
          {step === "type" ? "1/2" : step === "details" ? "2/2" : "Done"}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem 1.25rem 2rem" }}>
        {/* ── Step 1: Choose type ── */}
        {step === "type" && (
          <>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.4rem",
                fontWeight: 600,
                letterSpacing: "-0.025em",
                color: "var(--ink)",
                marginBottom: "0.5rem",
              }}
            >
              What kind of issue is it?
            </h1>
            <p style={{ fontSize: "0.82rem", color: "var(--ink-3)", marginBottom: "1.5rem" }}>
              Choose the type that best matches what you found.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
                marginBottom: "1.5rem",
              }}
            >
              {REPORT_TYPES.map(({ type, emoji, label, desc }) => {
                const active = reportType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setReportType(type)}
                    aria-pressed={active}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      padding: "0.875rem",
                      borderRadius: "var(--radius)",
                      border: "1.5px solid",
                      borderColor: active ? "var(--civic)" : "var(--border)",
                      background: active ? "#FDECEA" : "var(--bg)",
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "var(--font-body)",
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ fontSize: "1.25rem" }}>{emoji}</span>
                    <span
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: active ? "var(--civic)" : "var(--ink)",
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: active ? "var(--civic)" : "var(--ink-3)",
                        lineHeight: 1.35,
                      }}
                    >
                      {desc}
                    </span>
                  </button>
                );
              })}
            </div>

            <Button
              block
              onClick={() => reportType && setStep("details")}
              disabled={!reportType}
              style={{ background: "var(--civic)" }}
            >
              Continue →
            </Button>
          </>
        )}

        {/* ── Step 2: Details ── */}
        {step === "details" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "#FDECEA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                }}
              >
                {REPORT_TYPES.find((r) => r.type === reportType)?.emoji}
              </span>
              <div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.06em",
                    color: "var(--civic)",
                  }}
                >
                  Reporting
                </div>
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--ink)" }}>
                  {REPORT_TYPES.find((r) => r.type === reportType)?.label}
                </div>
              </div>
            </div>

            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.3rem",
                fontWeight: 600,
                letterSpacing: "-0.025em",
                color: "var(--ink)",
                marginBottom: "1.25rem",
              }}
            >
              Describe what you found
            </h2>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "var(--ink)",
                  marginBottom: 6,
                }}
              >
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What exactly is the problem? Where is it located? Any safety concern?"
                rows={4}
                style={{
                  width: "100%",
                  background: "var(--surface)",
                  border: "1.5px solid var(--border)",
                  borderRadius: 14,
                  padding: 14,
                  fontSize: "0.85rem",
                  fontFamily: "var(--font-body)",
                  color: "var(--ink)",
                  resize: "none" as const,
                  outline: "none",
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
                marginBottom: "1rem",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "var(--ink)",
                    marginBottom: 6,
                  }}
                >
                  Street address{" "}
                  <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1.5px solid var(--border)",
                    fontSize: "0.85rem",
                    color: "var(--ink)",
                    fontFamily: "var(--font-body)",
                    background: "var(--surface)",
                    outline: "none",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "var(--ink)",
                    marginBottom: 6,
                  }}
                >
                  City
                </label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="New York"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1.5px solid var(--border)",
                    fontSize: "0.85rem",
                    color: "var(--ink)",
                    fontFamily: "var(--font-body)",
                    background: "var(--surface)",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Location note */}
            <div
              style={{
                background: "var(--surface)",
                borderRadius: "var(--radius-sm)",
                padding: "10px 14px",
                marginBottom: "1.25rem",
                fontSize: "0.78rem",
                color: "var(--ink-3)",
              }}
            >
              📍 <strong style={{ color: "var(--ink)" }}>Location pin</strong> — drag the map pin to
              the exact location (coming once Mapbox token is configured).
            </div>

            {error && (
              <p style={{ fontSize: "0.82rem", color: "var(--civic)", marginBottom: "1rem" }}>
                {error}
              </p>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setStep("type")}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "var(--radius-sm)",
                  border: "1.5px solid var(--border)",
                  background: "var(--surface)",
                  fontSize: "1.1rem",
                  cursor: "pointer",
                }}
              >
                ←
              </button>
              <Button
                block
                onClick={handleSubmit}
                disabled={submitting || !description.trim()}
                style={{ background: "var(--civic)" }}
              >
                {submitting ? "Submitting…" : "Submit report"}
              </Button>
            </div>
          </>
        )}

        {/* ── Confirmation ── */}
        {step === "confirm" && (
          <div style={{ textAlign: "center", paddingTop: "2rem" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#E6F7F1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.25rem",
                fontSize: "1.75rem",
              }}
            >
              ✅
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.4rem",
                fontWeight: 600,
                color: "var(--ink)",
                marginBottom: "0.5rem",
              }}
            >
              Report submitted
            </h2>
            <p
              style={{
                fontSize: "0.88rem",
                color: "var(--ink-2)",
                lineHeight: 1.6,
                marginBottom: "1.5rem",
                maxWidth: 320,
                margin: "0 auto 1.5rem",
              }}
            >
              {routed311
                ? "We've sent this straight to your city's 311 system — no phone call needed."
                : "Your report has been saved. We'll route it to the city 311 system when the SeeClickFix integration is fully configured."}
            </p>

            {/* Route trace */}
            <div
              style={{
                background: "var(--surface)",
                borderRadius: "var(--radius)",
                padding: "1rem",
                marginBottom: "1.5rem",
                textAlign: "left",
              }}
            >
              {[
                { label: "Submitted", done: true },
                { label: "Routed to city 311", done: routed311 },
                { label: "City crew assigned", done: false },
              ].map(({ label, done }) => (
                <div
                  key={label}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}
                >
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: done ? "var(--score-green)" : "var(--border)",
                      color: done ? "#fff" : "var(--ink-3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {done ? "✓" : "·"}
                  </span>
                  <span
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: done ? "var(--ink)" : "var(--ink-3)",
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {reference && (
              <p style={{ fontSize: "0.75rem", color: "var(--ink-3)", marginBottom: "1.5rem" }}>
                Reference:{" "}
                <code style={{ fontSize: "0.72rem", color: "var(--ink)" }}>{reference}</code>
              </p>
            )}

            <Link
              href="/map"
              style={{
                display: "inline-block",
                background: "var(--civic)",
                color: "#fff",
                padding: "12px 24px",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.9rem",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              View on civic map
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
