"use client";
import { useState } from "react";

export function useAIAssist() {
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");

  const askAI = async (question: string, context: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/assist", {
        method: "POST",
        body: JSON.stringify({ question, context }),
      });
      const data = await res.json();
      setAnswer(data.reply);
    } catch (error) {
      console.error("Assist error:", error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, answer, askAI };
}
