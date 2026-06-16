"use client";
import { useState } from "react";

export function useAIInsights() {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<any>(null);

  const generateInsights = async (context: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        body: JSON.stringify({ context }),
      });
      const data = await res.json();
      setInsight(data);
    } catch (err) {
      console.error("AI Insights error:", err);
    } finally {
      setLoading(false);
    }
  };

  return { loading, insight, generateInsights };
}
