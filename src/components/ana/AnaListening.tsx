"use client";

// Mic icon — orb uses 2-path version (28×28, stroke 2.2) without stem/base.
const MicOrb = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
       stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
  </svg>
);

// Waveform bar specs from reference: heights, colors, and animation delays.
const WAVE_BARS = [
  { h: 10, color: "rgba(99,102,241,0.7)", delay: "0s" },
  { h: 20, color: "rgba(99,102,241,0.7)", delay: "0.1s" },
  { h: 28, color: "#6366F1",              delay: "0.2s" },
  { h: 32, color: "#818CF8",              delay: "0.15s" },
  { h: 26, color: "#6366F1",              delay: "0.25s" },
  { h: 18, color: "rgba(99,102,241,0.7)", delay: "0.1s" },
  { h: 10, color: "rgba(99,102,241,0.7)", delay: "0.05s" },
];

// Pulsing ring sizes and animation delays per reference.
const RINGS = [
  { size: 96,  delay: "0s" },
  { size: 112, delay: "0.4s" },
  { size: 128, delay: "0.8s" },
];

export default function AnaListening({
  transcript,
  onDismiss,
}: {
  transcript: string;
  onDismiss: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        // radial-gradient from reference: indigo centre, almost-black surround
        background: "radial-gradient(ellipse at 50% 60%, rgba(99,102,241,0.15) 0%, rgba(13,13,14,0.97) 70%)",
      }}
    >
      {/* Orb group — centered at 60% height per reference transform: translate(-50%, -60%) */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -60%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
        }}
      >
        {/* Orb container — 120×120 */}
        <div style={{ width: 120, height: 120, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Three pulsing rings */}
          {RINGS.map(({ size, delay }) => (
            <div
              key={size}
              style={{
                position: "absolute",
                width: size,
                height: size,
                borderRadius: "50%",
                border: "1.5px solid rgba(99,102,241,0.4)",
                animation: `ana-pulse-ring 2s ease-in-out infinite ${delay}`,
              }}
            />
          ))}
          {/* Core — 80×80, bright gradient, mic icon */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366F1, #818CF8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 40px rgba(99,102,241,0.5)",
              position: "relative",
              zIndex: 2,
            }}
          >
            <MicOrb />
          </div>
        </div>

        {/* Name + state */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.4rem",
              fontWeight: 600,
              color: "white",
              letterSpacing: "-0.01em",
            }}
          >
            Ana
          </div>
          <div
            style={{
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.04em",
              marginTop: 4,
            }}
          >
            Listening...
          </div>
        </div>

        {/* Waveform — 7 bars, 32px height, gap 4px */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, height: 32 }}>
          {WAVE_BARS.map(({ h, color, delay }, i) => (
            <div
              key={i}
              style={{
                width: 3,
                height: h,
                borderRadius: 3,
                background: color,
                animation: `ana-wave 1.2s ease-in-out infinite ${delay}`,
              }}
            />
          ))}
        </div>

        {/* Live transcript preview card */}
        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 14,
            padding: "12px 20px",
            textAlign: "center",
            maxWidth: 280,
          }}
        >
          <div
            style={{
              fontSize: "0.88rem",
              color: "white",
              fontWeight: 600,
              fontStyle: "italic",
              fontFamily: "var(--font-body)",
            }}
          >
            {transcript
              ? `"${transcript}"`
              : "“Is there a wheelchair accessible restaurant near me open right now?”"}
          </div>
        </div>
      </div>

      {/* Dismiss — bottom: 60px, centered */}
      <button
        onClick={onDismiss}
        aria-label="Cancel listening"
        style={{
          position: "absolute",
          bottom: 60,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "rgba(255,255,255,0.4)",
          fontSize: "0.78rem",
          fontWeight: 600,
          fontFamily: "var(--font-body)",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.6)",
            fontSize: "1.1rem",
          }}
        >
          ✕
        </div>
        Tap to cancel
      </button>
    </div>
  );
}
