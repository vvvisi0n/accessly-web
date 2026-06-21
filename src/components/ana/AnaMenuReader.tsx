"use client";

// Handles all read_image tasks with the camera-view visual shell from the
// reference: dark gradient background, indigo bounding-box, top status pill,
// and the response sheet below.

import { useRef, useState } from "react";

const TASK_LABELS: Record<string, string> = {
  menu:          "Ana is reading the menu",
  sign:          "Ana is reading the sign",
  mail:          "Ana is reading your mail",
  describe_room: "Ana is describing the room",
  hazard_check:  "Ana is checking for hazards",
  find_item:     "Ana is looking for your item",
};

// Mic icon — 16×16 version for sheet input button.
const MicSmall = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
  </svg>
);

// Ana avatar for the sheet header.
const AnaAvatar = () => (
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
    <MicSmall />
  </div>
);

interface Props {
  task: "menu" | "sign" | "mail" | "describe_room" | "hazard_check" | "find_item";
  onCapture: (base64: string, mediaType: "image/jpeg" | "image/png" | "image/webp", task: string) => void;
  onDismiss: () => void;
}

export default function AnaMenuReader({ task, onCapture, onDismiss }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const statusLabel = TASK_LABELS[task] ?? "Ana is reading";

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      const mediaType: "image/jpeg" | "image/png" | "image/webp" =
        file.type === "image/png" ? "image/png"
        : file.type === "image/webp" ? "image/webp"
        : "image/jpeg";
      setPreview(dataUrl);
      setProcessing(true);
      onCapture(base64, mediaType, task);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* Camera view area — dark gradient from reference */}
      <div
        style={{
          flex: 1,
          position: "relative",
          background: "linear-gradient(180deg, #2a2a2e, #1a1a1d)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt="Captured"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          // Bounding-box placeholder — exactly as in the reference
          <div
            style={{
              border: "2px solid rgba(99,102,241,0.6)",
              borderRadius: 8,
              width: 280,
              height: 160,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 0 4px rgba(99,102,241,0.12)",
            }}
          >
            <div
              style={{
                textAlign: "center",
                color: "rgba(255,255,255,0.3)",
                fontSize: "0.78rem",
                fontWeight: 600,
              }}
            >
              {processing ? "Analysing..." : "Tap below to take a photo"}
            </div>
          </div>
        )}

        {/* Top bar — close button · status pill · spacer (reference layout) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={onDismiss}
            aria-label="Close"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              border: "none",
              color: "white",
              fontSize: "1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>

          {/* Status pill with white live dot */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: "rgba(99,102,241,0.9)",
              padding: "7px 14px",
              borderRadius: 100,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "white",
              }}
            />
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "white" }}>
              {statusLabel}
            </span>
          </div>

          {/* Spacer to keep pill centered */}
          <div style={{ width: 32 }} />
        </div>
      </div>

      {/* Bottom sheet — same design as AnaResponseSheet */}
      <div
        style={{
          background: "white",
          borderRadius: "28px 28px 0 0",
          boxShadow: "0 -12px 40px rgba(0,0,0,0.15)",
          overflow: "hidden",
        }}
      >
        {/* Handle */}
        <div style={{ padding: "10px 0 0", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 36, height: 4, background: "#E8E8EC", borderRadius: 4 }} />
        </div>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 18px 10px",
            borderBottom: "1px solid #E8E8EC",
          }}
        >
          <AnaAvatar />
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0D0D0E" }}>
              {task === "menu" ? "Menu reader" : statusLabel.replace("Ana is ", "")}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#8A8A90" }}>
              {processing ? "Reading aloud · tap any item for details" : "Point your camera and tap below"}
            </div>
          </div>
        </div>

        {/* Suggestion chips */}
        {!processing && (
          <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "12px 16px 0", scrollbarWidth: "none" }}>
            {["Keep reading", "Gluten-free options", "Under $25", "Vegetarian"].map((chip) => (
              <div
                key={chip}
                style={{
                  fontSize: "0.74rem",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  padding: "7px 13px",
                  borderRadius: 100,
                  border: "1.5px solid #E8E8EC",
                  background: "white",
                  color: "#3D3D40",
                  flexShrink: 0,
                }}
              >
                {chip}
              </div>
            ))}
          </div>
        )}

        {/* Input row / capture button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px 28px",
            borderTop: processing ? "1px solid #E8E8EC" : undefined,
            marginTop: processing ? 0 : 10,
          }}
        >
          {!processing ? (
            <>
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 100,
                  background: "#6366F1",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  fontFamily: "var(--font-body)",
                  boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
                }}
              >
                Take photo
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFile}
                style={{ display: "none" }}
              />
            </>
          ) : (
            <>
              <input
                placeholder={`Ask about the ${task.replace(/_/g, " ")}...`}
                style={{
                  flex: 1,
                  background: "#F5F5F7",
                  border: "1.5px solid #E8E8EC",
                  borderRadius: 100,
                  padding: "10px 14px",
                  fontSize: "0.84rem",
                  color: "#0D0D0E",
                  fontFamily: "var(--font-body)",
                  outline: "none",
                }}
              />
              <button
                aria-label="Voice input"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: "#6366F1",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
                }}
              >
                <MicSmall />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
