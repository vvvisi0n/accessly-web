"use client";

import { useEffect, useState } from "react";

/**
 * 💤 useOfflineWakeWord (Mock-compatible)
 * Works offline and simulates wake triggers for local testing.
 * This version skips Porcupine imports until a real key/model is used.
 */
export default function useOfflineWakeWord({
  onWake,
  accessKey = "TEST_MODE_KEY",
  sensitivity = 0.7,
}: {
  onWake: () => void;
  accessKey?: string;
  sensitivity?: number;
}) {
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cleanup = () => {};
    try {
      if (!accessKey || accessKey === "TEST_MODE_KEY") {
        console.warn("🧠 Running MOCK WAKE MODE — 'Hey Accessly' simulated locally.");
        setActive(true);

        const interval = setInterval(() => {
          if (Math.random() > 0.75) {
            console.log("🎯 Simulated wake trigger — Hey Accessly");
            onWake();
          }
        }, 30000);

        cleanup = () => clearInterval(interval);
        return () => cleanup();
      }

      // Placeholder for real Porcupine setup (future use)
      setActive(true);
    } catch (e: any) {
      console.error("Wake word error:", e);
      setError(e.message || "Wake module failed to initialize");
    }

    return () => cleanup();
  }, [accessKey, sensitivity, onWake]);

  return { active, error };
}
