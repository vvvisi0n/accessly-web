"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  enqueueItem,
  getAllQueued,
  removeQueued,
  getQueueCount,
  type QueueItem,
} from "@/lib/offline/db";

export interface UseOfflineQueueReturn {
  isOnline: boolean;
  pendingCount: number;
  enqueueReview: (payload: unknown) => Promise<string>;
  enqueueCivicReport: (payload: unknown) => Promise<string>;
}

export function useOfflineQueue(): UseOfflineQueueReturn {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState(0);
  const syncing = useRef(false);

  // Load initial pending count from IDB
  useEffect(() => {
    getQueueCount().then(setPendingCount).catch(() => {});
  }, []);

  // Drain the queue by POSTing each item to its endpoint.
  // Uses native fetch - Supabase session cookie is included automatically.
  const syncQueue = useCallback(async () => {
    if (syncing.current) return;
    syncing.current = true;
    try {
      const items = await getAllQueued();
      for (const item of items) {
        try {
          const res = await fetch(item.endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item.payload),
          });
          if (res.ok || res.status === 409) {
            // 409 = duplicate (already submitted); treat as success
            await removeQueued(item.id);
          }
        } catch {
          // Network still unavailable for this item - leave it in the queue
        }
      }
    } finally {
      syncing.current = false;
      const count = await getQueueCount();
      setPendingCount(count);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncQueue]);

  const enqueueReview = useCallback(
    async (payload: unknown): Promise<string> => {
      const id = await enqueueItem({ type: "review", endpoint: "/api/reviews", payload });
      setPendingCount((n) => n + 1);
      return id;
    },
    []
  );

  const enqueueCivicReport = useCallback(
    async (payload: unknown): Promise<string> => {
      const id = await enqueueItem({ type: "civic", endpoint: "/api/civic", payload });
      setPendingCount((n) => n + 1);
      return id;
    },
    []
  );

  return { isOnline, pendingCount, enqueueReview, enqueueCivicReport };
}

// Lightweight version for components that only need the count + online state
export function useOfflineStatus(): { isOnline: boolean; pendingCount: number } {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    getQueueCount().then(setPendingCount).catch(() => {});

    const refresh = () => getQueueCount().then(setPendingCount).catch(() => {});
    const handleOnline = () => { setIsOnline(true); refresh(); };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    // Re-read count whenever the page becomes visible (tab switch back)
    document.addEventListener("visibilitychange", refresh);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  return { isOnline, pendingCount };
}
