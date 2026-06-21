"use client";

// Mic icon — 22×22, stroke 2.2. Full path with stem and base line per the
// reference design (the orb uses a shorter 2-path version; the FAB uses all 4).
const MicFull = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
       stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8"  y1="23" x2="16" y2="23" />
  </svg>
);

export default function AnaTrigger({ onActivate }: { onActivate: () => void }) {
  return (
    <>
      {/* Tooltip — "Say 'Ana' or tap" — right: 74px matches reference */}
      <div
        style={{
          position: "fixed",
          bottom: 96, // aligns vertically with the FAB centre (88 + ~8 offset)
          right: 74,
          background: "#0D0D0E",
          color: "white",
          fontSize: "0.7rem",
          fontWeight: 700,
          padding: "5px 10px",
          borderRadius: 8,
          whiteSpace: "nowrap",
          zIndex: 50,
          pointerEvents: "none",
          fontFamily: "var(--font-body)",
        }}
      >
        Say &ldquo;Ana&rdquo; or tap
        {/* Right-pointing arrow */}
        <span
          style={{
            position: "absolute",
            right: -5,
            top: "50%",
            transform: "translateY(-50%)",
            width: 0,
            height: 0,
            borderTop: "5px solid transparent",
            borderBottom: "5px solid transparent",
            borderLeft: "5px solid #0D0D0E",
          }}
        />
      </div>

      {/* FAB — 52×52, indigo gradient, bottom-right above bottom nav */}
      <button
        onClick={onActivate}
        aria-label="Activate Ana voice companion — say Ana or tap"
        style={{
          position: "fixed",
          bottom: 88,
          right: 16,
          zIndex: 50,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6366F1, #818CF8)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 20px rgba(99,102,241,0.45)",
          padding: 0,
        }}
      >
        <MicFull />
      </button>
    </>
  );
}
