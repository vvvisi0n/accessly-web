"use client";

import { useEffect, useRef, useState } from "react";

// Reference: thinking state uses a darker orb gradient (#4F46E5 → #6366F1)
// and a step feed showing completed steps (green dot) and current (animated dot).

function StepCard({
  text,
  done,
}: {
  text: string;
  done: boolean;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.06)",
        borderRadius: 10,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: 280,
      }}
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: done ? "#00C27A" : "#6366F1",
          flexShrink: 0,
          animation: done ? undefined : "ana-think-bounce 1.4s ease-in-out infinite",
        }}
      />
      <div style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)" }}>
        {text}
      </div>
    </div>
  );
}

export default function AnaThinking({
  statusText,
  onDismiss,
}: {
  statusText: string;
  onDismiss: () => void;
}) {
  // Build a live history of completed steps so the reference's multi-card
  // feed is visible. Max 2 completed steps shown above the current one.
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const prevRef = useRef<string>(statusText);

  useEffect(() => {
    if (statusText !== prevRef.current && prevRef.current) {
      setCompletedSteps((prev) => [...prev, prevRef.current].slice(-2));
    }
    prevRef.current = statusText;
  }, [statusText]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "radial-gradient(ellipse at 50% 60%, rgba(99,102,241,0.15) 0%, rgba(13,13,14,0.97) 70%)",
      }}
    >
      {/* Orb group */}
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
        {/* Orb — thinking variant: darker gradient, dots instead of mic */}
        <div style={{ width: 80, height: 80, position: "relative" }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              // Reference: thinking orb uses #4F46E5 → #6366F1 (darker than listening)
              background: "linear-gradient(135deg, #4F46E5, #6366F1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 40px rgba(99,102,241,0.4)",
            }}
          >
            {/* Three bouncing dots — 8×8, #818CF8, gap 6px */}
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

        {/* Name + live status label */}
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
            {statusText}
          </div>
        </div>

        {/* Step feed — completed (green dot) + current (animated dot) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {completedSteps.map((step, i) => (
            <StepCard key={i} text={step} done />
          ))}
          <StepCard text={statusText} done={false} />
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
