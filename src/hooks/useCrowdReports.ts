import { useEffect, useRef, useState } from "react";

export interface CrowdReport {
  id: string;
  lat: number;
  lng: number;
  type: "blocked_ramp" | "elevator_down" | "construction" | "flooding" | "other";
  note?: string;
  createdAt: number;
  userId?: string;
  photoUrl?: string;
}

interface Options {
  bbox?: { n: number; s: number; e: number; w: number } | null;
  pollMs?: number; // replace with realtime later
}

export default function useCrowdReports({ bbox, pollMs = 10000 }: Options) {
  const [reports, setReports] = useState<CrowdReport[]>([]);
  const lastFetch = useRef(0);

  // TODO: swap to realtime (Supabase Realtime/WebSocket)
  useEffect(() => {
    if (!bbox) return;
    const interval = setInterval(async () => {
      if (Date.now() - lastFetch.current < pollMs - 50) return;
      lastFetch.current = Date.now();
      // simulate fetch
      setReports((prev) => prev.slice(-200));
    }, pollMs);
    return () => clearInterval(interval);
  }, [bbox, pollMs]);

  function submitReport(r: Omit<CrowdReport, "id" | "createdAt">) {
    const withId: CrowdReport = {
      ...r,
      id: Math.random().toString(36).slice(2),
      createdAt: Date.now(),
    };
    setReports((prev) => [withId, ...prev].slice(0, 500));
    // TODO: send to /api/reports/create or Supabase
    return withId.id;
  }

  return { reports, submitReport };
}
