"use client";
import { useState } from "react";

interface ScanResult {
  summary: string;
  issues: string[];
  score: number;
}

export function useAIScan() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const runScan = async (area: string, context: string) => {
    if (!area) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area, context }),
      });
      if (!res.ok) throw new Error("Network response not ok");
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Scan error:", error);
      setResult({
        summary: "Scan failed",
        issues: ["Network error or invalid data"],
        score: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return { loading, result, runScan };
}
