"use client";

import { useEffect, useRef, useState } from "react";
import type { AnaMessage } from "@/hooks/useAna";
import AACQuickReplies from "./AACQuickReplies";

// Mic icon in sheet — 16×16, stroke 2.4, 2-path version.
const MicSmall = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
  </svg>
);

// Avatar — 32×32, indigo gradient, mic icon.
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

// Default chips shown when the conversation starts — from the reference example.
const DEFAULT_CHIPS = [
  "📍 Directions to Nami",
  "🚗 Request accessible ride",
  "See all 3 options",
  "🌧️ Check weather first",
];

interface Props {
  messages: AnaMessage[];
  isSpeaking: boolean;
  showAACReplies: boolean;
  onSendText: (text: string) => void;
  onVoiceActivate: () => void;
  onDismiss: () => void;
}

export default function AnaResponseSheet({
  messages,
  isSpeaking,
  showAACReplies,
  onSendText,
  onVoiceActivate,
  onDismiss,
}: Props) {
  const [inputText, setInputText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const t = inputText.trim();
    if (!t) return;
    setInputText("");
    onSendText(t);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "white",
        borderRadius: "28px 28px 0 0",
        boxShadow: "0 -12px 40px rgba(0,0,0,0.15)",
        overflow: "hidden",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* Handle */}
      <div style={{ padding: "10px 0 0", display: "flex", justifyContent: "center" }}>
        <div style={{ width: 36, height: 4, background: "#E8E8EC", borderRadius: 4 }} />
      </div>

      {/* Header — avatar + name + subtitle + close */}
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
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0D0D0E" }}>Ana</div>
          <div style={{ fontSize: "0.7rem", color: "#8A8A90" }}>
            {isSpeaking ? "Speaking..." : "Your Accessana companion"}
          </div>
        </div>
        <button
          onClick={onDismiss}
          aria-label="Close Ana"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#8A8A90",
            fontSize: "1rem",
            lineHeight: 1,
            padding: 4,
          }}
        >
          ✕
        </button>
      </div>

      {/* Messages — max-height 320px, scrollable, no scrollbar */}
      <div
        style={{
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          maxHeight: 320,
          overflowY: "auto",
          scrollbarWidth: "none",
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              fontSize: "0.84rem",
              color: "#8A8A90",
              textAlign: "center",
              padding: "1rem 0",
              fontStyle: "italic",
            }}
          >
            Ask Ana anything, by voice or text.
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              maxWidth: "82%",
              padding: "11px 14px",
              borderRadius: m.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
              fontSize: "0.84rem",
              lineHeight: 1.5,
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              background: m.role === "user" ? "#1B6EF3" : "#EEF2FF",
              color: m.role === "user" ? "white" : "#0D0D0E",
              whiteSpace: "pre-wrap",
            }}
          >
            {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* AAC quick replies — only for speech-impaired profiles */}
      {showAACReplies && <AACQuickReplies onSelect={onSendText} />}

      {/* Suggestion chips — shown when no conversation yet */}
      {messages.length === 0 && (
        <div
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            padding: "0 16px 10px",
            scrollbarWidth: "none",
          }}
        >
          {DEFAULT_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => onSendText(chip)}
              style={{
                fontSize: "0.74rem",
                fontWeight: 600,
                whiteSpace: "nowrap",
                padding: "7px 13px",
                borderRadius: 100,
                border: "1.5px solid #E8E8EC",
                background: "white",
                color: "#3D3D40",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                flexShrink: 0,
              }}
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input row — text field + mic button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px 28px",
          borderTop: "1px solid #E8E8EC",
        }}
      >
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask Ana anything..."
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
        {/* Always show mic; tap mic to switch to voice input */}
        <button
          onClick={inputText.trim() ? handleSend : onVoiceActivate}
          aria-label={inputText.trim() ? "Send" : "Speak to Ana"}
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
          {inputText.trim() ? (
            // Send arrow when there is typed text
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          ) : (
            <MicSmall />
          )}
        </button>
      </div>
    </div>
  );
}
