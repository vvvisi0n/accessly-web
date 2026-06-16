import { NextResponse } from "next/server";

const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY!;

function biasWeight(mode: string, name: string) {
  const t = `${name}`.toLowerCase();
  // crude biasing to prefer likely-fit venues
  if (mode === "deaf_hoh" && /theater|museum|library/.test(t)) return 1.3;
  if (mode === "low_vision" && /museum|library|government|clinic/.test(t)) return 1.2;
  return 1.0; // wheelchair handled by baseline query
}

export async function POST(req: Request) {
  try {
    const { kind = "general", mode = "wheelchair", location } = await req.json();
    if (!location?.lat || !location?.lng) {
      return NextResponse.json({ places: [] });
    }

    const base =
      kind === "restaurant"
        ? "wheelchair accessible restaurant"
        : kind === "hotel"
          ? "wheelchair accessible hotel"
          : kind === "bathroom"
            ? "accessible public restroom"
            : kind === "park"
              ? "accessible park"
              : kind === "hospital"
                ? "hospital accessible entrance"
                : kind === "museum"
                  ? "accessible museum"
                  : kind === "transport"
                    ? "accessible transit station"
                    : "accessible place";

    const hint =
      mode === "low_vision"
        ? " tactile signage high contrast lighting "
        : mode === "deaf_hoh"
          ? " captioning visual alerts quiet seating "
          : "";

    const query = `${base} ${hint}`.trim();

    const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
    url.searchParams.set("query", query);
    url.searchParams.set("location", `${location.lat},${location.lng}`);
    url.searchParams.set("radius", "4000");
    url.searchParams.set("key", GOOGLE_KEY);

    const res = await fetch(url.toString());
    const data = await res.json();

    const places = (data.results || []).slice(0, 20).map((r: any) => {
      const lat = r.geometry?.location?.lat ?? 0;
      const lng = r.geometry?.location?.lng ?? 0;
      const score = (r.rating ?? 3.8) * biasWeight(mode, r.name);
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        r.name
      )}&query_place_id=${r.place_id}`;
      return {
        name: r.name,
        address: r.formatted_address || r.vicinity || "",
        rating: r.rating,
        lat,
        lng,
        place_id: r.place_id,
        url,
        weight: score,
      };
    });

    return NextResponse.json({ places });
  } catch (e) {
    console.error("nearby route error:", e);
    return NextResponse.json({ places: [] }, { status: 500 });
  }
}
