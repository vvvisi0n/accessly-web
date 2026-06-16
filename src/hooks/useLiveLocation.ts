"use client";

import { useEffect, useState } from "react";

export interface LiveCoords {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

export default function useLiveLocation() {
  const [coords, setCoords] = useState<LiveCoords | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported.");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    );
    setWatchId(id);

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return { coords, error };
}
