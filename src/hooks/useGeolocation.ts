"use client";

import { useEffect, useState } from "react";

export type GeolocationStatus = "pending" | "granted" | "denied" | "unavailable";

export interface GeolocationState {
  status: GeolocationStatus;
  lat: number | null;
  lng: number | null;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    status: "pending",
    lat: null,
    lng: null,
  });

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({ status: "unavailable", lat: null, lng: null });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          status: "granted",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        setState({
          status: err.code === err.PERMISSION_DENIED ? "denied" : "unavailable",
          lat: null,
          lng: null,
        });
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return state;
}
