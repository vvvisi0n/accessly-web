"use client";

import { useEffect, useState } from "react";
import { LiveCoords } from "./useLiveLocation";

export interface NearbyPlace {
  id: string;
  name: string;
  category: string;
  wheelchair: string;
  lat: number;
  lng: number;
  address: string;
}

export default function useNearbyAccessiblePlaces(coords: LiveCoords | null) {
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!coords) return;

    async function fetchNearby() {
      setLoading(true);
      try {
        const res = await fetch("/api/ai/nearby", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: coords.lat, lng: coords.lng }),
        });
        const data = await res.json();
        if (data.places) setPlaces(data.places);
      } catch (e) {
        console.error("Nearby load error:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchNearby();
  }, [coords?.lat, coords?.lng]);

  return { places, loading };
}
