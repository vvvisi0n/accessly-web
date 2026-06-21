"use client";

// Handles all read_image tasks: menu, sign, mail, describe_room, hazard_check, find_item.
// File name kept as AnaMenuReader per brief to avoid unnecessary churn.

import { useRef, useState } from "react";

const TASK_LABELS: Record<string, string> = {
  menu: "Reading the menu",
  sign: "Reading the sign",
  mail: "Reading your mail",
  describe_room: "Describing the room",
  hazard_check: "Checking for hazards",
  find_item: "Looking for your item",
};

interface Props {
  task: "menu" | "sign" | "mail" | "describe_room" | "hazard_check" | "find_item";
  onCapture: (base64: string, mediaType: "image/jpeg" | "image/png" | "image/webp", task: string) => void;
  onDismiss: () => void;
}

export default function AnaMenuReader({ task, onCapture, onDismiss }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const label = TASK_LABELS[task] ?? "Ana is reading";

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      const mediaType = (file.type === "image/png" ? "image/png"
        : file.type === "image/webp" ? "image/webp"
        : "image/jpeg") as "image/jpeg" | "image/png" | "image/webp";

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
        background: "#1a1a1d",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Camera-view area */}
      <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {preview ? (
          <img
            src={preview}
            alt="Captured"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
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
              color: "rgba(255,255,255,0.3)",
              fontSize: "0.78rem",
              fontWeight: 600,
            }}
          >
            Tap to take a photo
          </div>
        )}

        {/* Top bar */}
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

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: "rgba(99,102,241,0.9)",
              padding: "7px 14px",
              borderRadius: "var(--radius-pill)",
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "white" }} />
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "white" }}>
              Ana is {label.toLowerCase()}
            </span>
          </div>

          <div style={{ width: 32 }} />
        </div>
      </div>

      {/* Capture button */}
      {!processing && (
        <div style={{ padding: "20px 16px 40px", display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              padding: "14px 32px",
              borderRadius: "var(--radius-pill)",
              background: "var(--ana)",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 700,
              fontFamily: "var(--font-body)",
              boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
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
        </div>
      )}

      {processing && (
        <div style={{ padding: "20px", textAlign: "center", color: "rgba(255,255,255,0.6)", fontSize: "0.84rem" }}>
          Ana is reading...
        </div>
      )}
    </div>
  );
}
