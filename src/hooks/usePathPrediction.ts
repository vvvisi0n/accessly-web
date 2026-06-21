import { useEffect, useState } from "react";

interface StepInfo {
  index: number;
  fromName: string;
  toName: string;
  summary: string;
  distance: number;
}

interface UsePathPredictionOptions {
  steps: StepInfo[];
  currentIndex: number;
  coords?: { lat: number; lng: number } | null;
  onHint?: (hint: string) => void;
  onApproachingTurn?: (nextStep: StepInfo) => void;
}

export default function usePathPrediction({
  steps,
  currentIndex,
  coords,
  onHint,
  onApproachingTurn,
}: UsePathPredictionOptions) {
  const [nextStep, setNextStep] = useState<StepInfo | null>(null);

  useEffect(() => {
    if (!steps || steps.length < 2) return;
    const upcoming = steps[currentIndex + 1];
    setNextStep(upcoming || null);
  }, [steps, currentIndex]);

  // Trigger contextual hints every 20 seconds
  useEffect(() => {
    if (!onHint) return;
    const interval = setInterval(() => {
      const hour = new Date().getHours();
      if (hour > 18) onHint("It’s getting dark. Would you like dark mode?");
      if (hour < 9) onHint("Morning. Shall I give you a quick overview of today’s route?");
    }, 20000);
    return () => clearInterval(interval);
  }, [onHint]);

  // Predict and alert near turn
  useEffect(() => {
    if (!coords || !nextStep || !onApproachingTurn) return;

    const randomProximity = Math.random(); // Simulated for now
    if (randomProximity < 0.2) {
      onApproachingTurn(nextStep);
    }
  }, [coords, nextStep, onApproachingTurn]);

  return { nextStep };
}
