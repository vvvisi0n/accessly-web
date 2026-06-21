"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import type { DisabilityType } from "@/types";

const DISABILITY_OPTIONS: {
  type: DisabilityType;
  label: string;
  desc: string;
  svg: React.ReactNode;
}[] = [
  {
    type: "mobility",
    label: "Mobility",
    desc: "Wheelchair, walker, or limited walking",
    svg: (
      <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
        <circle cx="16" cy="11" r="4.5" stroke="currentColor" strokeWidth="2.8" />
        <path
          d="M11 22 C11 19 13.5 17 16 17 C18.5 17 21 19 21 22"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M16 17 L16 28 L11 38 M16 28 L21 38"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="32" cy="32" r="8" stroke="currentColor" strokeWidth="2.6" fill="none" />
        <path d="M32 17 L32 24" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    type: "vision",
    label: "Vision",
    desc: "Low vision or blind",
    svg: (
      <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
        <path
          d="M6 24 C6 24 13 13 24 13 C35 13 42 24 42 24 C42 24 35 35 24 35 C13 35 6 24 6 24 Z"
          stroke="currentColor"
          strokeWidth="2.8"
          fill="none"
          strokeLinejoin="round"
        />
        <path
          d="M18 24 C18 20.5 20.5 18 24 18 C27.5 18 30 20.5 30 24"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    type: "hearing",
    label: "Hearing",
    desc: "Deaf or hard of hearing",
    svg: (
      <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
        <path
          d="M22 8 C22 8 14 10 14 22 L14 30 C14 33 11 33 11 36 C11 39 22 40 22 40"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M27 16 C30 19 30 27 27 30"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M33 11 C39 18 39 28 33 35"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.45"
        />
      </svg>
    ),
  },
  {
    type: "cognitive",
    label: "Cognitive",
    desc: "Memory, focus, or processing needs",
    svg: (
      <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
        <path
          d="M10 30 C10 18 17 11 24 11 C31 11 38 18 38 30"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M18 24 L24 30 L30 20"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    type: "sensory",
    label: "Sensory",
    desc: "Noise, light, or sensory sensitivity",
    svg: (
      <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="3" fill="currentColor" />
        <path
          d="M24 24 L24 11 M24 24 L34 31 M24 24 L14 31"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M8 16 C8 16 16 30 24 30 C32 30 40 16 40 16"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.35"
        />
      </svg>
    ),
  },
  {
    type: "other",
    label: "Service animal",
    desc: "Guide dog or service animal user",
    svg: (
      <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
        <path
          d="M24 38 C16 32 9 26 9 18 C9 13 13 10 17 10 C20 10 23 12 24 15 C25 12 28 10 31 10 C35 10 39 13 39 18 C39 26 32 32 24 38 Z"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "zh", label: "中文" },
  { value: "ja", label: "日本語" },
  { value: "pt", label: "Português" },
  { value: "ar", label: "العربية" },
];

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [displayName, setDisplayName] = useState("");
  const [selected, setSelected] = useState<DisabilityType[]>([]);
  const [language, setLanguage] = useState("en");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace("/");
    });
  }, []);

  function toggle(type: DisabilityType) {
    setSelected((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be signed in.");
      setSaving(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await supabase.from("users").upsert({
      id: user.id,
      display_name: displayName.trim() || null,
      disability_types: selected,
      preferred_language: language,
    } as any);

    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }
    router.push("/search");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "2rem 1.25rem 4rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <p
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--blue)",
              marginBottom: "0.5rem",
            }}
          >
            Personalize your experience
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.7rem",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              color: "var(--ink)",
              lineHeight: 1.2,
              marginBottom: "0.5rem",
            }}
          >
            Tell us your needs
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--ink-3)", lineHeight: 1.6 }}>
            We&apos;ll use this to surface places that actually work for you and highlight relevant
            accessibility details.
          </p>
        </div>

        {/* Display name */}
        <div style={{ marginBottom: "1.75rem" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "var(--ink)",
              marginBottom: "0.5rem",
            }}
          >
            Your name <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Jordan"
            style={{
              width: "100%",
              padding: "11px 14px",
              borderRadius: "var(--radius-sm)",
              border: "1.5px solid var(--border)",
              background: "var(--surface)",
              fontSize: "0.9rem",
              color: "var(--ink)",
              fontFamily: "var(--font-body)",
              outline: "none",
            }}
          />
        </div>

        {/* Disability type grid */}
        <div style={{ marginBottom: "1.75rem" }}>
          <p
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "var(--ink)",
              marginBottom: "0.75rem",
            }}
          >
            Which of these apply to you?{" "}
            <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>Select all that apply</span>
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            {DISABILITY_OPTIONS.map(({ type, label, desc, svg }) => {
              const active = selected.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggle(type)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "1rem",
                    borderRadius: "var(--radius)",
                    textAlign: "left",
                    border: active ? "1.5px solid var(--blue)" : "1.5px solid var(--border)",
                    background: active ? "var(--blue-soft)" : "var(--bg)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    fontFamily: "var(--font-body)",
                  }}
                  aria-pressed={active}
                >
                  <span
                    style={{
                      color: active ? "var(--blue)" : "var(--ink-3)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {svg}
                  </span>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: active ? "var(--blue)" : "var(--ink)",
                      display: "block",
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: active ? "var(--blue)" : "var(--ink-3)",
                      lineHeight: 1.4,
                      marginTop: 2,
                    }}
                  >
                    {desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Language */}
        <div style={{ marginBottom: "2rem" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "var(--ink)",
              marginBottom: "0.5rem",
            }}
          >
            Preferred language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              width: "100%",
              padding: "11px 14px",
              borderRadius: "var(--radius-sm)",
              border: "1.5px solid var(--border)",
              background: "var(--surface)",
              fontSize: "0.88rem",
              color: "var(--ink)",
              fontFamily: "var(--font-body)",
              outline: "none",
              appearance: "none",
            }}
          >
            {LANGUAGES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p style={{ fontSize: "0.82rem", color: "var(--score-red)", marginBottom: "1rem" }}>
            {error}
          </p>
        )}

        <Button block onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save and find places →"}
        </Button>

        <p
          style={{
            textAlign: "center",
            marginTop: "1rem",
            fontSize: "0.75rem",
            color: "var(--ink-3)",
          }}
        >
          You can update these anytime from your account settings.
        </p>
      </div>
    </main>
  );
}
