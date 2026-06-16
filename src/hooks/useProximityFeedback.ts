"use client";

import { useEffect, useRef, useState } from "react";

export type ProxPoint = {
  id: string | number;
  name: string;
  lat: number;
  lng: number;
  category?: string;
};

export type Coords = { lat: number; lng: number };

function toRad(d: number) {
  return (d * Math.PI) / 180;
}
function haversine(a: Coords, b: Coords) {
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

type Options = {
  enabled?: boolean;
  points: ProxPoint[];
  coords: Coords | null;
  // thresholds in meters
  vibrateAt?: number[]; // e.g., [50, 20]
  // beep cadence: closer -> faster
  minBeepIntervalMs?: number; // fastest cadence
  maxBeepIntervalMs?: number; // slowest cadence
  nearestOnly?: boolean; // only alert for nearest target
};

export default function useProximityFeedback({
  enabled = false,
  points,
  coords,
  vibrateAt = [50, 20],
  minBeepIntervalMs = 600,
  maxBeepIntervalMs = 2000,
  nearestOnly = true,
}: Options) {
  const [nearest, setNearest] = useState<{ point: ProxPoint; distance: number } | null>(null);
  const [within, setWithin] = useState<number | null>(null);
  const hitSetRef = useRef<Set<string | number>>(new Set());

  // Audio
  const audioCtxRef = useRef<AudioContext | null>(null);
  const beepTimerRef = useRef<number | null>(null);

  // compute nearest + trigger beeps/vibration
  useEffect(() => {
    if (!enabled || !coords || !points?.length) {
      setNearest(null);
      setWithin(null);
      stopBeep();
      return;
    }

    // find nearest point
    let best: { point: ProxPoint; distance: number } | null = null;
    for (const p of points) {
      const d = haversine(coords, { lat: p.lat, lng: p.lng });
      if (!best || d < best.distance) best = { point: p, distance: d };
    }
    setNearest(best);

    const alerts = nearestOnly ? (best ? [best] : []) : points.map(p => ({
      point: p,
      distance: haversine(coords, { lat: p.lat, lng: p.lng }),
    }));

    // threshold-based vibration (one-shot per threshold per point)
    for (const a of alerts) {
      for (const t of vibrateAt) {
        const key = `${a.point.id}@${t}`;
        if (a.distance <= t && !hitSetRef.current.has(key)) {
          hitSetRef.current.add(key);
          try {
            if ("vibrate" in navigator) {
              navigator.vibrate?.(t <= 25 ? 40 : 25); // slightly stronger for closer
            }
          } catch {}
        }
      }
    }

    // continuous beep cadence toward nearest (if exists)
    if (best) {
      setWithin(best.distance);
      startOrAdjustBeep(best.distance);
    } else {
      stopBeep();
    }

    // cleanup on unmount
    return () => {
      // no-op
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, JSON.stringify(coords), points?.length]);

  function startOrAdjustBeep(distance: number) {
    // Map distance (0..200m+) -> interval (min..max)
    const cap = Math.max(0, Math.min(distance, 200)); // cap at 200m
    const ratio = 1 - cap / 200; // closer -> bigger ratio
    const interval = Math.round(
      maxBeepIntervalMs - ratio * (maxBeepIntervalMs - minBeepIntervalMs)
    );

    // restart timer with new interval
    stopBeep();
    beepTimerRef.current = window.setInterval(() => {
      beepOnce(distance < 30 ? 660 : distance < 80 ? 520 : 440, 0.06); // higher pitch when very close
    }, interval);
  }

  function ensureAudio() {
    if (audioCtxRef.current) return audioCtxRef.current;
    try {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      audioCtxRef.current = null;
    }
    return audioCtxRef.current;
  }

  function beepOnce(freq = 440, duration = 0.05) {
    const ctx = ensureAudio();
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.value = 0.0001;
    o.connect(g);
    g.connect(ctx.destination);

    const now = ctx.currentTime;
    g.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    o.start(now);
    o.stop(now + duration);
  }

  function stopBeep() {
    if (beepTimerRef.current !== null) {
      window.clearInterval(beepTimerRef.current);
      beepTimerRef.current = null;
    }
  }

  // public API
  return {
    nearest,       // { point, distance } | null
    within,        // number | null (meters to nearest)
    enabled,       // mirror
    stopBeep,      // manual stop
  };
}
