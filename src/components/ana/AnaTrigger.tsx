"use client";

const MIC_SVG = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

export default function AnaTrigger({ onActivate }: { onActivate: () => void }) {
  return (
    <>
      {/* Tooltip */}
      <div
        style={{
          position: "fixed",
          bottom: 100,
          right: 82,
          background: "var(--ink)",
          color: "white",
          fontSize: "0.7rem",
          fontWeight: 700,
          padding: "5px 10px",
          borderRadius: 8,
          whiteSpace: "nowrap",
          zIndex: 50,
          pointerEvents: "none",
        }}
      >
        Say &quot;Ana&quot; or tap
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
            borderLeft: "5px solid var(--ink)",
          }}
        />
      </div>

      {/* FAB */}
      <button
        onClick={onActivate}
        aria-label="Activate Ana voice companion"
        style={{
          position: "fixed",
          bottom: 88,
          right: 16,
          zIndex: 50,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--ana), #818CF8)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 20px rgba(99,102,241,0.45)",
          padding: 0,
        }}
      >
        {MIC_SVG}
      </button>
    </>
  );
}
