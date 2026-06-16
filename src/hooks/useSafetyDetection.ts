import { useEffect, useState } from "react";

interface SafetyInputs {
  noiseLevel: number;
  brightness: "bright" | "dim" | "normal";
  weather?: string;
  emotion?: string;
  obstacle?: string | null;
  motionActive?: boolean;
}

export interface SafetyState {
  safeMode: boolean;
  reason: string | null;
}

interface UseSafetyDetectionOptions extends SafetyInputs {
  onSafetyChange?: (state: SafetyState) => void;
}

export default function useSafetyDetection({
  noiseLevel,
  brightness,
  weather,
  emotion,
  obstacle,
  motionActive,
  onSafetyChange,
}: UseSafetyDetectionOptions) {
  const [safety, setSafety] = useState<SafetyState>({ safeMode: false, reason: null });

  useEffect(() => {
    let reason: string | null = null;

    if (noiseLevel > 85) reason = "High noise levels detected.";
    else if (brightness === "dim") reason = "Low visibility detected.";
    else if (["61", "63", "65"].includes(weather || "")) reason = "Rainy conditions.";
    else if (emotion === "frustrated") reason = "User frustration detected.";
    else if (obstacle) reason = `Obstacle ahead: ${obstacle}`;
    else if (motionActive) reason = "Device movement suggests instability.";

    const nextSafeMode = !!reason;
    const nextState = { safeMode: nextSafeMode, reason };
    setSafety(nextState);

    if (onSafetyChange) onSafetyChange(nextState);
  }, [noiseLevel, brightness, weather, emotion, obstacle, motionActive, onSafetyChange]);

  return safety;
}
