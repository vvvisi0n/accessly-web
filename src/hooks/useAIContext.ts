"use client";
import { useState, useEffect } from "react";

/**
 * Stores and retrieves AI context (preferences, history) from localStorage.
 */
export function useAIContext() {
  const [context, setContext] = useState<any>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("accessly-ai-context");
      return saved ? JSON.parse(saved) : { preferences: {} };
    }
    return { preferences: {} };
  });

  const updateContext = (key: string, value: any) => {
    setContext((prev: any) => {
      const updated = { ...prev, [key]: value };
      if (typeof window !== "undefined") {
        localStorage.setItem("accessly-ai-context", JSON.stringify(updated));
      }
      return updated;
    });
  };

  return { context, updateContext };
}
