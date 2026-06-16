"use client";
import { useState } from "react";

export function useAIReport() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const generateReport = async (context: string, findings: string[]) => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/report", {
        method: "POST",
        body: JSON.stringify({ context, findings }),
      });
      const data = await res.json();
      setReport(data);
    } catch (error) {
      console.error("Report error:", error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, report, generateReport };
}
