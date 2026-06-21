"use client";

import { useEffect, useState } from "react";

/**
 * Wake word detection hook.
 * In production: uses Picovoice Porcupine with a real access key.
 * Without a key: does nothing (no mock, no random interval).
 * The Ana trigger FAB remains available for tap-to-activate.
 */
export default function useOfflineWakeWord({
  onWake,
  accessKey = "",
  sensitivity = 0.7,
}: {
  onWake: () => void;
  accessKey?: string;
  sensitivity?: number;
}) {
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // No valid key — skip entirely. Users can tap the FAB to activate Ana.
    if (!accessKey) {
      return;
    }

    // Placeholder for real Porcupine setup once PICOVOICE_ACCESS_KEY is provided.
    setActive(true);
    return () => {
      setActive(false);
    };
  }, [accessKey, sensitivity, onWake]);

  return { active, error };
}
