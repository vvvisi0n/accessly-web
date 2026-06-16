"use client";
import { useState } from "react";

export function useAIRender() {
  const [loading, setLoading] = useState(false);
  const [renderData, setRenderData] = useState<any>(null);

  const generateRender = async (layoutType: "2D" | "3D", context: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/render", {
        method: "POST",
        body: JSON.stringify({ layoutType, context }),
      });
      const data = await res.json();
      setRenderData(data);
    } catch (error) {
      console.error("Render error:", error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, renderData, generateRender };
}
