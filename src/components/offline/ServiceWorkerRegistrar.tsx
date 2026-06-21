"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW registration failures are non-fatal - app works without it,
        // just without offline venue page caching.
      });
    }
  }, []);

  return null;
}
