import { useEffect, useState } from "react";

export type ObstacleType = "stairs" | "construction" | "blocked" | "unknown";
export interface Obstacle {
  id: string;
  type: ObstacleType;
  distance: number; // meters
  description?: string;
}

interface Options {
  coords: { lat: number; lng: number } | null;
  pollMs?: number;
  onObstacleDetected?: (o: Obstacle) => void;
  onClear?: () => void;
}

export default function useObstacleAvoidance({
  coords,
  pollMs = 8000,
  onObstacleDetected,
  onClear,
}: Options) {
  const [obstacle, setObstacle] = useState<Obstacle | null>(null);

  useEffect(() => {
    if (!coords) return;
    const interval = setInterval(() => {
      const r = Math.random();
      if (r < 0.1) {
        const detected: Obstacle = {
          id: Math.random().toString(36).slice(2),
          type: ["stairs", "construction", "blocked"][
            Math.floor(Math.random() * 3)
          ] as ObstacleType,
          distance: Math.floor(Math.random() * 80) + 10,
          description: "Simulated obstacle from sensor/crowd feed",
        };
        setObstacle(detected);
        onObstacleDetected?.(detected);
      } else if (obstacle && r > 0.8) {
        setObstacle(null);
        onClear?.();
      }
    }, pollMs);
    return () => clearInterval(interval);
  }, [coords, pollMs, onObstacleDetected, onClear, obstacle]);

  return { obstacle };
}
