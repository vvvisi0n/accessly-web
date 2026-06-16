import { NextResponse } from "next/server";
import type { PlacesRequest, PlacesResponse, AccessiblePlace } from "@/types/ai";

/**
 * /api/ai/places
 * --------------
 * Fetches nearby accessible locations using Google Places API.
 */
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY!;

export async function POST(req: Request) {
  try {
    const { query, lat, lng }: PlacesRequest = await req.json();

    if (!query || !lat || !lng) {
      return NextResponse.json({ error: "Missing query, lat, or lng fields." }, { status: 400 });
    }

    const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    url.searchParams.append("keyword", query);
    url.searchParams.append("location", `${lat},${lng}`);
    url.searchParams.append("radius", "3000"); // meters (~3km)
    url.searchParams.append("key", GOOGLE_API_KEY);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (!data.results || data.status !== "OK") {
      console.warn("Google Places API returned:", data.status);
      return NextResponse.json({ places: [] });
    }

    const accessiblePlaces: AccessiblePlace[] = data.results
      .filter(
        (place: any) =>
          place.wheelchair_accessible_entrance === true ||
          place.types?.includes("restaurant") ||
          place.types?.includes("cafe")
      )
      .map(
        (place: any): AccessiblePlace => ({
          id: place.place_id,
          name: place.name,
          address: place.vicinity,
          rating: place.rating || undefined,
          location: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
          },
        })
      );

    const result: PlacesResponse = { places: accessiblePlaces };
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Places API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch accessible places." },
      { status: 500 }
    );
  }
}
