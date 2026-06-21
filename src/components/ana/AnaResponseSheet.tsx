"use client";

import { useEffect, useRef, useState } from "react";
import type { AnaMessage } from "@/hooks/useAna";
import AACQuickReplies from "./AACQuickReplies";

const ANA_AVATAR = (
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    </svg>
  </div>
);

const MIC_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
  </svg>
);

interface Props {
  messages: AnaMessage[];
  isSpeaking: boolean;
  showAACReplies: boolean;
  onSendText: (text: string) => void;
  onVoiceActivate: () => void;
  onDismiss: () => void;
}

const SUGGESTION_CHIPS = [
  "Get accessible directions",
  "Request a WAV ride",
  "Read the menu",
  "Check the weather",
  "File a 311 report",
];

export default function AnaResponseSheet({
  messages,
  isSpeaking,
  showAACReplies,
  onSendText,
  onVoiceActivate,
  onDismiss,
}: Props) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText("");
    onSendText(text);
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
      }}
    >
      {/* Handle */}
      <div style={{ padding: "10px 0 0", display: "flex", justifyContent: "center" }}>
        <div style={{ width: 36, height: 4, background: "var(--border)", borderRadius: 4 }} />
      </div>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 18px 10px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {ANA_AVATAR}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--ink)" }}>Ana</div>
          <div style={{ fontSize: "0.7rem", color: "var(--ink-3)" }}>
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
            color: "var(--ink-3)",
            fontSize: "1rem",
            padding: 4,
          }}
        >
          ✕
        </button>
      </div>

      {/* Messages — live captioning is default (bubbles shown + spoken simultaneously) */}
      <div
        style={{
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          maxHeight: 280,
          overflowY: "auto",
          scrollbarWidth: "none",
        }}
      >
        {messages.length === 0 && (
          <div style={{ fontSize: "0.84rem", color: "var(--ink-3)", textAlign: "center", padding: "1rem 0" }}>
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
              background: m.role === "user" ? "var(--blue)" : "var(--ana-soft)",
              color: m.role === "user" ? "white" : "var(--ink)",
              whiteSpace: "pre-wrap",
            }}
          >
            {m.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* AAC quick replies — shown for users with speech impairment */}
      {showAACReplies && <AACQuickReplies onSelect={onSendText} />}

      {/* Suggestion chips */}
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
          {SUGGESTION_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => onSendText(chip)}
              style={{
                fontSize: "0.74rem",
                fontWeight: 600,
                whiteSpace: "nowrap",
                padding: "7px 13px",
                borderRadius: "var(--radius-pill)",
                border: "1.5px solid var(--border)",
                background: "white",
                color: "var(--ink-2)",
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

      {/* Input row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px 28px",
          borderTop: "1px solid var(--border)",
        }}
      >
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask Ana anything..."
          style={{
            flex: 1,
            background: "var(--surface)",
            border: "1.5px solid var(--border)",
            borderRadius: "var(--radius-pill)",
            padding: "10px 14px",
            fontSize: "0.84rem",
            color: "var(--ink)",
            fontFamily: "var(--font-body)",
            outline: "none",
          }}
        />
        {inputText ? (
          <button
            onClick={handleSend}
            aria-label="Send"
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "var(--ana)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: "white",
              fontWeight: 700,
              fontSize: "1rem",
            }}
          >
            ↑
          </button>
        ) : (
          <button
            onClick={onVoiceActivate}
            aria-label="Speak to Ana"
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "var(--ana)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
            }}
          >
            {MIC_ICON}
          </button>
        )}
      </div>
    </div>
  );
}
