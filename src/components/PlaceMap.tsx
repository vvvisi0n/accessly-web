"use client";

import { useEffect, useRef } from "react";

interface PlaceMapProps {
  onPlaceSelect?: (placeName: string) => void;
}

export default function PlaceMap({ onPlaceSelect }: PlaceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!window.google || !mapRef.current || !autocompleteRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 40.7128, lng: -74.006 },
      zoom: 12,
    });

    const input = autocompleteRef.current;
    const autocomplete = new window.google.maps.places.Autocomplete(input);

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) return;

      const location = place.geometry.location;
      map.setCenter(location);

      if (onPlaceSelect && place.name) {
        onPlaceSelect(place.name);
      }

      new window.google.maps.Marker({
        position: location,
        map,
      });
    });
  }, [onPlaceSelect]);

  return (
    <div className="space-y-2">
      <input
        ref={autocompleteRef}
        placeholder="Search a place"
        className="w-full p-2 border rounded"
        type="text"
      />
      <div ref={mapRef} className="w-full h-64 rounded shadow border" />
    </div>
  );
}
