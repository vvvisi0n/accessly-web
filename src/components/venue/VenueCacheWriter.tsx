"use client";

import { useEffect } from "react";
import { cacheVenue, type VenueCacheEntry } from "@/lib/offline/db";

type Props = Omit<VenueCacheEntry, "cachedAt">;

// Included in the venue Server Component page - writes venue data to IDB
// the moment the page loads online, so it's available for offline fallback.
export default function VenueCacheWriter(props: Props) {
  useEffect(() => {
    cacheVenue(props).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.id]);

  return null;
}
