"use client";
import { useState } from "react";
import { useAIContext } from "./useAIContext";

/**
 * Handles chat messages and talks to /api/ai/chat.
 */
export function useChatbot() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const { context, updateContext } = useAIContext();

  const sendMessage = async (text: string, location?: string) => {
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message: text, location, context }),
      });
      const data = await res.json();

      if (data.contextUpdate) {
        updateContext(data.contextUpdate.key, data.contextUpdate.value);
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading };
}
