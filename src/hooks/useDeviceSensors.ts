"use client";

import { useEffect, useRef, useState } from "react";

interface SensorHandlers {
  onShake?: () => void;
  onTilt?: (tiltX: number, tiltY: number) => void;
  onMotion?: (accel: number) => void;
}

export default function useDeviceSensors({
  onShake,
  onTilt,
  onMotion,
}: SensorHandlers = {}) {
  const [enabled, setEnabled] = useState(false);
  const lastAccel = useRef<number>(0);
  const lastShake = useRef<number>(0);

  // Shake threshold (m/s²)
  const SHAKE_THRESHOLD = 18;
  const SHAKE_INTERVAL = 1000; // 1 s cooldown

  useEffect(() => {
    if (!enabled) return;

    function handleMotion(e: DeviceMotionEvent) {
      const { x, y, z } = e.accelerationIncludingGravity || {};
      if (x == null || y == null || z == null) return;

      const accel = Math.sqrt(x * x + y * y + z * z);
      onMotion?.(accel);

      const now = Date.now();
      if (accel - lastAccel.current > SHAKE_THRESHOLD && now - lastShake.current > SHAKE_INTERVAL) {
        lastShake.current = now;
        onShake?.();
      }
      lastAccel.current = accel;
    }

    function handleOrientation(e: DeviceOrientationEvent) {
      const tiltX = e.beta || 0; // front/back
      const tiltY = e.gamma || 0; // left/right
      onTilt?.(tiltX, tiltY);
    }

    window.addEventListener("devicemotion", handleMotion);
    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [enabled]);

  return { enabled, setEnabled };
}
