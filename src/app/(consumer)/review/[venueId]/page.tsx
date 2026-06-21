"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import type { DisabilityType, CheckpointKey } from "@/types";

// ── Step config ───────────────────────────────────────────────────────────
const STEPS: {
  key: CheckpointKey;
  emoji: string;
  label: string;
  question: string;
  sub: string;
  questions: string[];
}[] = [
  {
    key: "entrance",
    emoji: "🚪",
    label: "Entrance",
    question: "How easy was it to get in?",
    sub: "Think about the main entrance you used.",
    questions: [
      "Step-free entrance available?",
      "Door opens automatically or is easy to open?",
      "Entrance clearly marked and well lit?",
    ],
  },
  {
    key: "bathrooms",
    emoji: "🚿",
    label: "Bathrooms",
    question: "Were accessible bathrooms available?",
    sub: "Rate the best bathroom option you found.",
    questions: ["Accessible stall available?", "Bathroom clearly signed and easy to find?"],
  },
  {
    key: "parking",
    emoji: "🅿️",
    label: "Parking",
    question: "Was accessible parking available?",
    sub: "If you didn't drive, you can skip the rating below.",
    questions: ["Designated accessible spots on site?", "Close to the entrance?"],
  },
  {
    key: "staff",
    emoji: "🙋",
    label: "Staff",
    question: "Were staff helpful and aware of accessibility needs?",
    sub: "Think about your interactions throughout your visit.",
    questions: [
      "Staff offered assistance without being asked?",
      "Staff knowledgeable about accessible routes or facilities?",
    ],
  },
  {
    key: "sensory",
    emoji: "🎧",
    label: "Sensory",
    question: "Was the environment comfortable?",
    sub: "Consider noise, lighting, and overall sensory load.",
    questions: ["Noise level was manageable?", "Lighting was comfortable (not too bright or dim)?"],
  },
];

const RATING_EMOJIS = ["😖", "😕", "😐", "🙂", "😄"];
const DISABILITY_OPTIONS: { type: DisabilityType; label: string }[] = [
  { type: "mobility", label: "Mobility" },
  { type: "vision", label: "Vision" },
  { type: "hearing", label: "Hearing" },
  { type: "cognitive", label: "Cognitive" },
  { type: "sensory", label: "Sensory" },
  { type: "other", label: "Other" },
];

type Scores = Partial<Record<CheckpointKey, number>>;
type Notes = Partial<Record<CheckpointKey, string>>;

export default function ReviewFlowPage() {
  const router = useRouter();
  const rawParams = useParams() ?? {};
  const venueId = (rawParams as { venueId?: string }).venueId ?? "";

  const [step, setStep] = useState(0); // 0-4 = checkpoints, 5 = summary
  const [scores, setScores] = useState<Scores>({});
  const [notes, setNotes] = useState<Notes>({});
  const [disabilityTypes, setDisabilityTypes] = useState<DisabilityType[]>([]);
  const [overallComment, setOverallComment] = useState("");
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [venueName, setVenueName] = useState("this venue");

  useEffect(() => {
    createClient()
      .from("venues")
      .select("name")
      .eq("id", venueId)
      .single()
      .then(({ data }) => {
        if (data?.name) setVenueName(data.name);
      });
  }, [venueId]);

  const totalSteps = STEPS.length + 1; // +1 for summary
  const isSummary = step === STEPS.length;
  const current = isSummary ? null : STEPS[step];

  function setScore(key: CheckpointKey, val: number) {
    setScores((prev) => ({ ...prev, [key]: val }));
  }
  function setNote(key: CheckpointKey, val: string) {
    setNotes((prev) => ({ ...prev, [key]: val }));
  }
  function toggleDisability(t: DisabilityType) {
    setDisabilityTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be signed in to submit a review.");
      setSubmitting(false);
      return;
    }

    const body: Record<string, unknown> = {
      venue_id: venueId,
      disability_types: disabilityTypes,
      overall_comment: overallComment.trim() || undefined,
      visit_date: visitDate,
    };

    STEPS.forEach(({ key }) => {
      body[`score_${key}`] = scores[key] ?? null;
      body[`note_${key}`] = notes[key]?.trim() || undefined;
    });

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data?.error ?? "Something went wrong.");
      setSubmitting(false);
      return;
    }
    router.push(`/venue/${venueId}`);
  }

  return (
    <div
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
        style={{ flexShrink: 0, borderBottom: "1px solid var(--border)", background: "var(--bg)" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px 10px",
          }}
        >
          <button
            onClick={() => (step > 0 ? setStep((s) => s - 1) : router.back())}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.2rem",
              color: "var(--ink-2)",
              padding: 4,
            }}
            aria-label="Back"
          >
            ✕
          </button>
          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--ink-2)" }}>
            Reviewing {venueName}
          </span>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--ink-3)" }}>
            {step + 1}/{totalSteps}
          </span>
        </div>

        {/* Progress bar, segmented */}
        <div style={{ display: "flex", gap: 3, padding: "0 16px 12px" }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: i <= step ? "var(--score-green)" : "var(--border)",
                transition: "background 0.25s",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Step content ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem 1.25rem 2rem" }}>
        {!isSummary && current && (
          <>
            {/* Eyebrow */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.75rem" }}>
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "var(--blue-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                }}
              >
                {current.emoji}
              </span>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase" as const,
                  color: "var(--blue)",
                }}
              >
                {current.label}
              </span>
            </div>

            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.35rem",
                fontWeight: 600,
                letterSpacing: "-0.025em",
                color: "var(--ink)",
                marginBottom: "0.4rem",
                lineHeight: 1.25,
              }}
            >
              {current.question}
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--ink-3)", marginBottom: "1.5rem" }}>
              {current.sub}
            </p>

            {/* Rating scale 1-5 */}
            <div style={{ display: "flex", gap: 8, marginBottom: "1.75rem" }}>
              {RATING_EMOJIS.map((emoji, i) => {
                const val = i + 1;
                const active = scores[current.key] === val;
                return (
                  <button
                    key={val}
                    onClick={() => setScore(current.key, val)}
                    aria-pressed={active}
                    aria-label={`Rate ${val} out of 5`}
                    style={{
                      flex: 1,
                      aspectRatio: "1",
                      borderRadius: 14,
                      border: "1.5px solid",
                      borderColor: active ? "var(--score-green)" : "var(--border)",
                      background: active ? "#E6F7F1" : "var(--surface)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    <span style={{ fontSize: "1.4rem" }}>{emoji}</span>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        color: active ? "var(--score-green)" : "var(--ink-3)",
                      }}
                    >
                      {val}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Checklist questions */}
            <div style={{ marginBottom: "1.5rem", borderTop: "1px solid var(--border)" }}>
              {current.questions.map((q) => (
                <div
                  key={q}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "14px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--ink)",
                      lineHeight: 1.4,
                      flex: 1,
                    }}
                  >
                    {q}
                  </span>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {(["Yes", "No"] as const).map((opt) => (
                      <button
                        key={opt}
                        style={{
                          width: 40,
                          height: 32,
                          borderRadius: 9,
                          border: "1.5px solid var(--border)",
                          background: "var(--surface)",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          color: "var(--ink-3)",
                          cursor: "pointer",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Note */}
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
                Add a note{" "}
                <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                value={notes[current.key] ?? ""}
                onChange={(e) => setNote(current.key, e.target.value)}
                placeholder="Anything helpful for the next person…"
                rows={3}
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
          </>
        )}

        {/* ── Summary / Step 6 ── */}
        {isSummary && (
          <>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.35rem",
                fontWeight: 600,
                letterSpacing: "-0.025em",
                color: "var(--ink)",
                marginBottom: "0.5rem",
              }}
            >
              Review summary
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--ink-3)", marginBottom: "1.5rem" }}>
              Check your ratings and add any final notes before submitting.
            </p>

            {/* Checkpoint summary rows */}
            {STEPS.map(({ key, emoji, label }) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "var(--ink)",
                  }}
                >
                  <span style={{ fontSize: "1rem" }}>{emoji}</span> {label}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {scores[key] ? (
                    <span
                      style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--score-green)" }}
                    >
                      {RATING_EMOJIS[scores[key]! - 1]} {scores[key]}/5
                    </span>
                  ) : (
                    <span style={{ fontSize: "0.78rem", color: "var(--ink-3)" }}>Skipped</span>
                  )}
                  <button
                    onClick={() => setStep(STEPS.findIndex((s) => s.key === key))}
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--blue)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                      fontWeight: 700,
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}

            {/* Disability types */}
            <div style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "var(--ink)",
                  marginBottom: "0.5rem",
                }}
              >
                Your accessibility needs{" "}
                <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>(optional)</span>
              </label>
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                {DISABILITY_OPTIONS.map(({ type, label }) => {
                  const active = disabilityTypes.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => toggleDisability(type)}
                      aria-pressed={active}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "var(--radius-pill)",
                        border: "1.5px solid",
                        borderColor: active ? "var(--blue)" : "var(--border)",
                        background: active ? "var(--blue-soft)" : "var(--bg)",
                        color: active ? "var(--blue)" : "var(--ink-2)",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Overall comment */}
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
                Overall comment{" "}
                <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                value={overallComment}
                onChange={(e) => setOverallComment(e.target.value)}
                placeholder="Anything else people should know about accessibility at this venue?"
                rows={3}
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

            {/* Visit date */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "var(--ink)",
                  marginBottom: 6,
                }}
              >
                Visit date
              </label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "1.5px solid var(--border)",
                  fontSize: "0.88rem",
                  color: "var(--ink)",
                  fontFamily: "var(--font-body)",
                  background: "var(--surface)",
                  outline: "none",
                }}
              />
            </div>

            {error && (
              <p style={{ fontSize: "0.82rem", color: "var(--score-red)", marginBottom: "1rem" }}>
                {error}
              </p>
            )}

            <Button block onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit review"}
            </Button>
          </>
        )}
      </div>

      {/* ── Footer nav (checkpoint steps only) ── */}
      {!isSummary && (
        <div
          style={{
            flexShrink: 0,
            padding: "12px 16px 24px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            gap: 10,
            background: "var(--bg)",
          }}
        >
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius-sm)",
                border: "1.5px solid var(--border)",
                background: "var(--surface)",
                fontSize: "1.1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Previous step"
            >
              ←
            </button>
          )}
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!scores[current!.key]}
            style={{
              flex: 1,
              height: 44,
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: scores[current!.key] ? "var(--blue)" : "var(--border)",
              color: scores[current!.key] ? "#fff" : "var(--ink-3)",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: scores[current!.key] ? "pointer" : "not-allowed",
              fontFamily: "var(--font-body)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            Continue <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
}
