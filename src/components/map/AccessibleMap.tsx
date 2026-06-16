"use client";

import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { useState, useEffect } from "react";

interface Place {
  name: string;
  lat: number;
  lng: number;
  address: string;
  rating?: number;
}

interface MapProps {
  query: string;
}

/**
 * Displays interactive map of accessible locations.
 */
export default function AccessibleMap({ query }: MapProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [activePlace, setActivePlace] = useState<Place | null>(null);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await fetch(`/api/ai/places?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.results) {
          const mapped = data.results.map((p: any) => ({
            name: p.name,
            lat: p.geometry.location.lat,
            lng: p.geometry.location.lng,
            address: p.formatted_address,
            rating: p.rating,
          }));
          setPlaces(mapped);
        }
      } catch (error) {
        console.error("Error fetching places:", error);
      }
    };

    if (query) fetchPlaces();
  }, [query]);

  const center = places.length > 0 ? places[0] : { lat: 37.7749, lng: -122.4194 };

  return (
    <div className="mt-4 border rounded-xl overflow-hidden shadow">
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
        <GoogleMap mapContainerStyle={{ height: "400px", width: "100%" }} center={center} zoom={13}>
          {places.map((place, i) => (
            <Marker
              key={i}
              position={{ lat: place.lat, lng: place.lng }}
              title={place.name}
              onClick={() => setActivePlace(place)}
            />
          ))}

          {activePlace && (
            <InfoWindow
              position={{ lat: activePlace.lat, lng: activePlace.lng }}
              onCloseClick={() => setActivePlace(null)}
            >
              <div className="text-sm">
                <h3 className="font-semibold">{activePlace.name}</h3>
                <p>{activePlace.address}</p>
                <p>{activePlace.rating ? `⭐ ${activePlace.rating}` : "No rating"}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    activePlace.name
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Open in Google Maps
                </a>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
