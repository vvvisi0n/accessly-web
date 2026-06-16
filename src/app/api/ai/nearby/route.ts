import { NextResponse } from "next/server";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

export async function POST(req: Request) {
  try {
    const { lat, lng, radius = 400 } = await req.json();
    if (!lat || !lng) {
      return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
    }

    // Overpass query for wheelchair-accessible nodes
    const query = `
      [out:json][timeout:25];
      (
        node(around:${radius},${lat},${lng})[wheelchair~"yes|limited"];
        node(around:${radius},${lat},${lng})[amenity~"toilets|cafe|restaurant|parking"];
      );
      out center;
    `;

    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      body: query,
    });

    const data = await res.json();

    const places = data.elements.map((el: any) => ({
      id: el.id,
      name: el.tags.name || el.tags.amenity || "Accessible location",
      category: el.tags.amenity || "other",
      wheelchair: el.tags.wheelchair || "unknown",
      lat: el.lat,
      lng: el.lon,
      address: el.tags["addr:street"]
        ? `${el.tags["addr:street"]} ${el.tags["addr:housenumber"] || ""}`
        : "Address unavailable",
    }));

    return NextResponse.json({ places });
  } catch (err: any) {
    console.error("Nearby fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch nearby places" }, { status: 500 });
  }
}
