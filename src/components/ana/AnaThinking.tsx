"use client";

export default function AnaThinking({
  statusText,
  onDismiss,
}: {
  statusText: string;
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
      {/* Orb with thinking dots */}
      <div style={{ position: "relative", width: 80, height: 80, marginBottom: 28 }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--ana-dark), var(--ana))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 40px rgba(99,102,241,0.4)",
          }}
        >
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {[0, 0.2, 0.4].map((delay, i) => (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#818CF8",
                  animation: `ana-think-bounce 1.4s ease-in-out infinite ${delay}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Name + state */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 600, color: "white", letterSpacing: "-0.01em" }}>
          Ana
        </div>
        <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.04em", marginTop: 4 }}>
          {statusText}
        </div>
      </div>

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
        @keyframes ana-think-bounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
