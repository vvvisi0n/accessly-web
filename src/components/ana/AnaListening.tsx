"use client";

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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at 50% 60%, rgba(99,102,241,0.15) 0%, rgba(13,13,14,0.97) 70%)",
      }}
    >
      {/* Orb */}
      <div style={{ position: "relative", width: 120, height: 120, marginBottom: 28 }}>
        {/* Pulsing rings */}
        {[96, 112, 128].map((size, i) => (
          <div
            key={size}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: size,
              height: size,
              marginTop: -size / 2,
              marginLeft: -size / 2,
              borderRadius: "50%",
              border: "1.5px solid rgba(99,102,241,0.4)",
              animation: `ana-pulse-ring 2s ease-in-out infinite ${i * 0.4}s`,
            }}
          />
        ))}
        {/* Core */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 80,
            height: 80,
            marginTop: -40,
            marginLeft: -40,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--ana), #818CF8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 40px rgba(99,102,241,0.5)",
            zIndex: 2,
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          </svg>
        </div>
      </div>

      {/* Name + state */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 600, color: "white", letterSpacing: "-0.01em" }}>
          Ana
        </div>
        <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.04em", marginTop: 4 }}>
          Listening...
        </div>
      </div>

      {/* Waveform */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, height: 32, marginBottom: 24 }}>
        {[10, 20, 28, 32, 26, 18, 10].map((h, i) => (
          <div
            key={i}
            style={{
              width: 3,
              height: h,
              borderRadius: 3,
              background: i === 3 ? "#818CF8" : i === 2 || i === 4 ? "var(--ana)" : "rgba(99,102,241,0.7)",
              animation: `ana-wave 1.2s ease-in-out infinite ${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* Live transcript */}
      {transcript && (
        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 14,
            padding: "12px 20px",
            maxWidth: 280,
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          <div style={{ fontSize: "0.88rem", color: "white", fontWeight: 600, fontStyle: "italic" }}>
            &ldquo;{transcript}&rdquo;
          </div>
        </div>
      )}

      {/* Dismiss */}
      <button
        onClick={onDismiss}
        aria-label="Cancel"
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

      <style>{`
        @keyframes ana-pulse-ring {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.15; transform: scale(1.06); }
        }
        @keyframes ana-wave {
          0%, 100% { transform: scaleY(0.5); opacity: 0.6; }
          50% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
