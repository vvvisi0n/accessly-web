// src/components/PlaceSearch.tsx
"use client";

import { useEffect, useRef } from "react";

export default function PlaceSearch() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!window.google || !inputRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["establishment"], // Can change to 'geocode' or 'address' etc.
      fields: ["name", "geometry", "place_id"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      console.log("Selected place:", place);
    });
  }, []);

  return (
    <div className="mb-4">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search places"
        className="w-full border p-2 rounded"
      />
    </div>
  );
}
