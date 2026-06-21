"use client";

// Proactive weather alert card — appears at top of any screen.
// Exact card, avatar, typography, and button specs from accessana-ana-voice-ui.html.

export interface WeatherAlert {
  title: string;      // "Ana · Heads up for Saturday"
  subtitle: string;   // "About your saved outing"
  body: string;       // Alert copy
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary: () => void;
  onSecondary: () => void;
}

// Mic icon — 15×15 for avatar.
const MicTiny = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
       stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
  </svg>
);

export default function AnaWeatherAlert({ alert }: { alert: WeatherAlert }) {
  return (
    // Position: top:64px to clear the Navbar, left/right:16px per reference.
    <div
      style={{
        position: "fixed",
        top: 64,
        left: 16,
        right: 16,
        zIndex: 60,
        fontFamily: "var(--font-body)",
      }}
    >
      <div
        style={{
          background: "white",
          border: "1.5px solid #E8E8EC",
          borderRadius: 18, // reference uses 18px, not the standard --radius 16px
          padding: "14px 16px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header row: avatar · title+subtitle · timestamp */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
          }}
        >
          {/* 32×32 Ana avatar */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366F1, #818CF8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <MicTiny />
          </div>

          <div>
            <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0D0D0E" }}>
              {alert.title}
            </div>
            <div style={{ fontSize: "0.68rem", color: "#8A8A90" }}>
              {alert.subtitle}
            </div>
          </div>

          {/* Timestamp — right-aligned */}
          <div style={{ marginLeft: "auto", fontSize: "0.7rem", color: "#8A8A90", flexShrink: 0 }}>
            Now
          </div>
        </div>

        {/* Alert body */}
        <p
          style={{
            fontSize: "0.82rem",
            color: "#3D3D40",
            lineHeight: 1.55,
            marginBottom: 12,
          }}
        >
          {alert.body}
        </p>

        {/* Two action buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={alert.onPrimary}
            style={{
              flex: 1,
              background: "#6366F1",
              color: "white",
              borderRadius: 100,
              padding: 9,
              textAlign: "center",
              fontSize: "0.76rem",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
            }}
          >
            {alert.primaryLabel}
          </button>
          <button
            onClick={alert.onSecondary}
            style={{
              flex: 1,
              background: "#F5F5F7",
              color: "#3D3D40",
              borderRadius: 100,
              padding: 9,
              textAlign: "center",
              fontSize: "0.76rem",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
            }}
          >
            {alert.secondaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
