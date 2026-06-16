"use client";

import { useState } from "react";

interface MemoryEntry {
  user: string;
  ai: string;
  timestamp: number;
}

export default function useAIContextMemory(limit = 10) {
  const [memory, setMemory] = useState<MemoryEntry[]>([]);

  function remember(user: string, ai: string) {
    setMemory((prev) => {
      const updated = [...prev, { user, ai, timestamp: Date.now() }];
      return updated.slice(-limit); // keep last N
    });
  }

  function summarizeContext() {
    return memory.map((m) => `User: ${m.user}\nAI: ${m.ai}`).join("\n");
  }

  function clearMemory() {
    setMemory([]);
  }

  return { memory, remember, summarizeContext, clearMemory };
}
