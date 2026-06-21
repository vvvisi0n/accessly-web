"use client";

import { useCallback } from "react";
import { cacheVenue, getCachedVenue, type VenueCacheEntry } from "@/lib/offline/db";

export function useVenueCache() {
  const saveVenue = useCallback((venue: Omit<VenueCacheEntry, "cachedAt">) => {
    cacheVenue(venue).catch(() => {});
  }, []);

  const loadCachedVenue = useCallback(
    (id: string): Promise<VenueCacheEntry | undefined> => getCachedVenue(id),
    []
  );

  return { saveVenue, loadCachedVenue };
}
