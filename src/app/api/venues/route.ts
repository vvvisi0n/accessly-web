import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { VenueCategory } from "@/types";

// ── Train-station proximity deduplication ─────────────────────
// OSM maps every subway entrance as a separate node, so a single
// station can appear 4-8 times. We group entries within 100 m of
// each other and surface only one representative per cluster.

// Supabase returns PostGIS geography as a hex EWKB string, not GeoJSON.
// Format: byteOrder(1B) + wkbType(4B) + [srid(4B)] + lng(8B) + lat(8B)
function ewkbToLatLng(hex: unknown): { lat: number; lng: number } | null {
  if (typeof hex !== "string" || hex.length < 42) return null;
  const buf = Buffer.from(hex, "hex");
  const isLE = buf[0] === 1;
  const typeFull = isLE ? buf.readUInt32LE(1) : buf.readUInt32BE(1);
  const hasSRID = (typeFull & 0x20000000) !== 0;
  const offset = hasSRID ? 9 : 5;
  if (buf.length < offset + 16) return null;
  const lng = isLE ? buf.readDoubleLE(offset) : buf.readDoubleBE(offset);
  const lat = isLE ? buf.readDoubleLE(offset + 8) : buf.readDoubleBE(offset + 8);
  if (!isFinite(lng) || !isFinite(lat)) return null;
  return { lat, lng };
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function groupNearbyStations<T extends { category: string; location: unknown }>(
  venues: T[]
): T[] {
  const stations = venues.filter((v) => v.category === "train_station");
  const others = venues.filter((v) => v.category !== "train_station");
  if (!stations.length) return venues;

  const used = new Set<number>();
  const reps: T[] = [];

  for (let i = 0; i < stations.length; i++) {
    if (used.has(i)) continue;
    used.add(i);
    const loc = stations[i].location as GeoPoint | null;
    if (loc) {
      const [rLng, rLat] = loc.coordinates;
      for (let j = i + 1; j < stations.length; j++) {
        if (used.has(j)) continue;
        const jLoc = stations[j].location as GeoPoint | null;
        if (jLoc) {
          const [jLng, jLat] = jLoc.coordinates;
          if (haversineMeters(rLat, rLng, jLat, jLng) <= 100) used.add(j);
        }
      }
    }
    reps.push(stations[i]);
  }

  return [...others, ...reps];
}

// ── GET /api/venues ───────────────────────────────────────────────────────
// Query params:
//   q           string   keyword search against venue name (ILIKE %q%)
//   city        string   filter by city (exact, case-insensitive)
//   category    string   venue_category enum value
//   minScore    number   minimum access_index
//   limit       number   max results (default 40, max 100)
//   offset      number   pagination offset

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const q = p.get("q") ?? undefined;
  const city = p.get("city") ?? undefined;
  const category = p.get("category") as VenueCategory | null;
  const minScore = p.get("minScore") ? Number(p.get("minScore")) : undefined;
  const limit = Math.min(Number(p.get("limit") ?? 40), 100);
  const offset = Number(p.get("offset") ?? 0);

  const supabase = await createClient();

  let query = supabase
    .from("venues")
    .select(
      "id, name, category, address, city, state, country, access_index, " +
        "score_entrance, score_bathrooms, score_parking, score_staff, score_sensory, " +
        "review_count, claimed, verified, certified, photos, location"
    )
    .order("access_index", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  if (q) query = query.ilike("name", `%${q}%`);
  if (city) query = query.ilike("city", city);
  if (category) query = query.eq("category", category);
  if (minScore !== undefined) query = query.gte("access_index", minScore);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Group OSM subway entrances, then extract lat/lng from the PostGIS GeoJSON
  // so clients can display distances without a separate geocoding call.
  const grouped = groupNearbyStations(data ?? []);
  const venues = grouped.map(({ location, ...v }) => {
    const coords = ewkbToLatLng(location);
    return { ...v, lat: coords?.lat ?? null, lng: coords?.lng ?? null };
  });

  return NextResponse.json({ venues, total: venues.length });
}

// ── POST /api/venues ──────────────────────────────────────────────────────
// Authenticated users may suggest a new venue.
// Body: { name, category, address, city, state, country, lat?, lng? }

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, category, address, city, state, country } = body as {
    name?: string;
    category?: VenueCategory;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  };

  if (!name?.trim() || !category) {
    return NextResponse.json({ error: "name and category are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("venues")
    .insert({
      name: name.trim(),
      category,
      address: address?.trim() ?? null,
      city: city?.trim() ?? null,
      state: state?.trim() ?? null,
      country: country?.trim() ?? "US",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ venue: data }, { status: 201 });
}
