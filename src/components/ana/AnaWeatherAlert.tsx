"use client";

export interface WeatherAlert {
  title: string;
  subtitle: string;
  body: string;
  primaryAction: string;
  secondaryAction: string;
  onPrimary: () => void;
  onSecondary: () => void;
}

export default function AnaWeatherAlert({ alert }: { alert: WeatherAlert }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 64,
        left: 16,
        right: 16,
        zIndex: 60,
        background: "white",
        border: "1.5px solid var(--border)",
        borderRadius: 18,
        padding: "14px 16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--ana), #818CF8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--ink)" }}>
            {alert.title}
          </div>
          <div style={{ fontSize: "0.68rem", color: "var(--ink-3)" }}>{alert.subtitle}</div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: "0.7rem", color: "var(--ink-3)" }}>Now</div>
      </div>

      {/* Body */}
      <p style={{ fontSize: "0.82rem", color: "var(--ink-2)", lineHeight: 1.55, marginBottom: 12 }}>
        {alert.body}
      </p>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={alert.onPrimary}
          style={{
            flex: 1,
            background: "var(--ana)",
            color: "white",
            borderRadius: "var(--radius-pill)",
            padding: 9,
            textAlign: "center",
            fontSize: "0.76rem",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
          }}
        >
          {alert.primaryAction}
        </button>
        <button
          onClick={alert.onSecondary}
          style={{
            flex: 1,
            background: "var(--surface)",
            color: "var(--ink-2)",
            borderRadius: "var(--radius-pill)",
            padding: 9,
            textAlign: "center",
            fontSize: "0.76rem",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
          }}
        >
          {alert.secondaryAction}
        </button>
      </div>
    </div>
  );
}
