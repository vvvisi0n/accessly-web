"use client";

import { useEffect, useState } from "react";

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

const KEY = "accessana_chat_history_v2";

export function useSessionMemory(maxMessages = 20) {
  const [history, setHistory] = useState<ChatMessage[]>([]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(history.slice(-maxMessages)));
    } catch {}
  }, [history, maxMessages]);

  const append = (msg: ChatMessage) => setHistory((prev) => [...prev, msg].slice(-maxMessages));

  const reset = () => setHistory([]);

  return { history, append, reset };
}
