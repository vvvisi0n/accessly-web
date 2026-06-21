"use client";

import { useState } from "react";
import type { ChatMessage } from "./useSessionMemory";

export function useAIAssistant() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  async function sendMessage(
    text: string,
    opts?: {
      userLanguage?: string; // "auto" or "en"/"es"/...
      location?: { lat: number; lng: number } | null;
      prefs?: { mode: string }; // "wheelchair" | "low_vision" | "deaf_hoh" | "none"
      history?: ChatMessage[]; // prior conversation
    }
  ) {
    setLoading(true);
    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          userLanguage: opts?.userLanguage ?? "auto",
          location: opts?.location ?? null,
          prefs: opts?.prefs ?? { mode: "none" },
          history: (opts?.history ?? []).slice(-12), // keep last 12 for context
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      } else if (data.error) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: "Sorry, I'm having trouble right now." },
        ]);
      }
    } catch (e) {
      console.error(e);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Network error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return { messages, loading, sendMessage };
}
