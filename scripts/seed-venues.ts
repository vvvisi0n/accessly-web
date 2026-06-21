/**
 * Seed Accessana venues from OpenStreetMap (Overpass API) and/or Google Places.
 *
 * Usage:
 *   npm run seed:venues -- --city "Brooklyn" --state "NY"
 *   npm run seed:venues -- --city "Chicago"  --state "IL" --source osm
 *   npm run seed:venues -- --city "Seattle"  --state "WA" --source google
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   GOOGLE_PLACES_API_KEY   (optional - OSM only if omitted)
 *
 * Rules (per Data Seeding Strategy):
 *   - Import venue listings only: name, address, category, location.
 *   - Never fabricate scores or import reviews.
 *   - Imported venues show "Be the first to review" in the UI.
 *   - No scraping of Yelp, Google reviews, or TripAdvisor.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";
import ws from "ws";

// ── Env ──────────────────────────────────────────────────────

function loadEnv() {
  try {
    const content = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (key && !(key in process.env)) process.env[key] = val;
    }
  } catch {
    /* .env.local may not exist in CI */
  }
}

loadEnv();

// ── CLI args ─────────────────────────────────────────────────

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

const CITY = arg("--city") ?? "Brooklyn";
const STATE = arg("--state") ?? "NY";
const SOURCE = (arg("--source") ?? "both") as "osm" | "google" | "both";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌  NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  process.exit(1);
}

if ((SOURCE === "google" || SOURCE === "both") && !GOOGLE_KEY) {
  console.warn("⚠️   GOOGLE_PLACES_API_KEY not set - skipping Google Places import.");
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  // ws type doesn't perfectly match Supabase's WebSocketLikeConstructor; cast is safe here
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  realtime: { transport: ws as any },
});

// ── Types ─────────────────────────────────────────────────────

type VenueCategory =
  | "restaurant" | "hotel" | "lounge" | "bar" | "cafe"
  | "hospital" | "clinic" | "pharmacy" | "transit_stop" | "train_station"
  | "airport" | "park" | "museum" | "theatre" | "cinema" | "gym" | "shopping"
  | "government" | "education" | "place_of_worship" | "other";

type ImportSource = "osm" | "google_places";

interface VenueInsert {
  name: string;
  category: VenueCategory;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  phone: string | null;
  website: string | null;
  osm_id?: string;
  google_place_id?: string;
  location: string;           // WKT: POINT(lng lat)
  import_source: ImportSource;
}

// ── Category maps ─────────────────────────────────────────────

const OSM_AMENITY: Record<string, VenueCategory> = {
  restaurant: "restaurant", fast_food: "restaurant", food_court: "restaurant",
  cafe: "cafe", coffee_shop: "cafe",
  bar: "bar", pub: "bar", biergarten: "bar",
  nightclub: "lounge", lounge: "lounge",
  hospital: "hospital",
  clinic: "clinic", doctors: "clinic", dentist: "clinic",
  pharmacy: "pharmacy",
  bus_station: "transit_stop", bus_stop: "transit_stop", ferry_terminal: "transit_stop",
  theatre: "theatre", arts_centre: "theatre",
  cinema: "cinema",
  gym: "gym",
  place_of_worship: "place_of_worship",
  school: "education", university: "education", college: "education",
  townhall: "government", courthouse: "government",
};

const OSM_TOURISM: Record<string, VenueCategory> = {
  hotel: "hotel", motel: "hotel", guest_house: "hotel", hostel: "hotel",
  museum: "museum", gallery: "museum",
};

const OSM_LEISURE: Record<string, VenueCategory> = {
  park: "park", garden: "park", nature_reserve: "park",
  fitness_centre: "gym", sports_centre: "gym",
};

const OSM_SHOP: Record<string, VenueCategory> = {
  mall: "shopping", supermarket: "shopping", department_store: "shopping",
};

const OSM_AEROWAY: Record<string, VenueCategory> = { aerodrome: "airport" };

const OSM_RAILWAY: Record<string, VenueCategory> = {
  station: "train_station", halt: "train_station",
  tram_stop: "transit_stop",
};

function osmCategory(tags: Record<string, string>): VenueCategory | null {
  if (tags.amenity)  return OSM_AMENITY[tags.amenity]   ?? null;
  if (tags.tourism)  return OSM_TOURISM[tags.tourism]   ?? null;
  if (tags.leisure)  return OSM_LEISURE[tags.leisure]   ?? null;
  if (tags.shop)     return OSM_SHOP[tags.shop]         ?? null;
  if (tags.aeroway)  return OSM_AEROWAY[tags.aeroway]   ?? null;
  if (tags.railway)  return OSM_RAILWAY[tags.railway]   ?? null;
  return null;
}

// Google Place types → venue_category (first match wins)
const GOOGLE_TYPE_MAP: Record<string, VenueCategory> = {
  restaurant: "restaurant", meal_takeaway: "restaurant", meal_delivery: "restaurant",
  cafe: "cafe", bakery: "cafe",
  bar: "bar", night_club: "lounge",
  lodging: "hotel",
  hospital: "hospital",
  doctor: "clinic", health: "clinic", dentist: "clinic",
  pharmacy: "pharmacy", drugstore: "pharmacy",
  transit_station: "transit_stop", bus_station: "transit_stop", subway_station: "transit_stop",
  train_station: "train_station", light_rail_station: "train_station",
  airport: "airport",
  park: "park",
  museum: "museum", art_gallery: "museum",
  movie_theater: "cinema",
  gym: "gym",
  shopping_mall: "shopping", department_store: "shopping", supermarket: "shopping",
  local_government_office: "government", city_hall: "government", courthouse: "government",
  school: "education", university: "education", library: "education",
  church: "place_of_worship", mosque: "place_of_worship", synagogue: "place_of_worship",
  hindu_temple: "place_of_worship",
  performing_arts_theater: "theatre",
};

function googleCategory(types: string[]): VenueCategory | null {
  for (const t of types) {
    if (GOOGLE_TYPE_MAP[t]) return GOOGLE_TYPE_MAP[t];
  }
  return null;
}

// ── Nominatim: city bounding box ──────────────────────────────

async function getCityBbox(city: string, state: string): Promise<[number, number, number, number]> {
  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}` +
    `&country=US&format=json&limit=1`;

  const res = await fetch(url, {
    headers: { "User-Agent": "Accessana/1.0 (seed-venues script)" },
  });

  if (!res.ok) throw new Error(`Nominatim error: ${res.status}`);

  const data = (await res.json()) as Array<{
    boundingbox: [string, string, string, string];
    display_name: string;
  }>;

  if (!data.length) throw new Error(`City not found in Nominatim: ${city}, ${state}`);

  const [south, north, west, east] = data[0].boundingbox.map(Number);
  console.log(`  Bounding box: S${south.toFixed(4)} W${west.toFixed(4)} N${north.toFixed(4)} E${east.toFixed(4)}`);
  return [south, west, north, east];
}

// ── OSM / Overpass ────────────────────────────────────────────

interface OverpassElement {
  id: number;
  type: "node" | "way" | "relation";
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags: Record<string, string>;
}

async function fetchOSMVenues(bbox: [number, number, number, number]): Promise<VenueInsert[]> {
  const [south, west, north, east] = bbox;
  const b = `${south},${west},${north},${east}`;

  const query = `
[out:json][timeout:90];
(
  nwr["amenity"~"^(restaurant|fast_food|food_court|cafe|bar|pub|biergarten|nightclub|hospital|clinic|doctors|dentist|pharmacy|bus_station|bus_stop|ferry_terminal|theatre|arts_centre|cinema|gym|place_of_worship|school|university|college|townhall|courthouse)$"](${b});
  nwr["tourism"~"^(hotel|motel|guest_house|hostel|museum|gallery)$"](${b});
  nwr["leisure"~"^(park|garden|nature_reserve|fitness_centre|sports_centre)$"](${b});
  nwr["shop"~"^(mall|supermarket|department_store)$"](${b});
  nwr["aeroway"="aerodrome"](${b});
  nwr["railway"~"^(station|halt|tram_stop)$"](${b});
);
out center tags 2000;
`.trim();

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query,
    headers: {
      "Content-Type": "text/plain",
      "User-Agent": "Accessana/1.0 (seed-venues script)",
    },
  });

  if (!res.ok) throw new Error(`Overpass API error: ${res.status} ${await res.text()}`);

  const { elements } = (await res.json()) as { elements: OverpassElement[] };
  console.log(`  OSM: received ${elements.length} elements`);

  const venues: VenueInsert[] = [];

  for (const el of elements) {
    const tags = el.tags ?? {};
    if (!tags.name?.trim()) continue;

    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (!lat || !lon) continue;

    const category = osmCategory(tags);
    if (!category) continue;

    const houseNumber = tags["addr:housenumber"] ?? "";
    const street = tags["addr:street"] ?? "";
    const address = houseNumber && street
      ? `${houseNumber} ${street}`
      : tags["addr:full"] ?? null;

    venues.push({
      name: tags.name.trim().slice(0, 200),
      category,
      address,
      // Fall back to the seed target city when OSM doesn't carry addr:city
      city: tags["addr:city"] ?? CITY,
      state: tags["addr:state"] ?? STATE,
      country: tags["addr:country"] ?? "US",
      phone: tags.phone ?? tags["contact:phone"] ?? null,
      website: tags.website ?? tags["contact:website"] ?? null,
      osm_id: String(el.id),
      location: `POINT(${lon} ${lat})`,
      import_source: "osm",
    });
  }

  return venues;
}

// ── Google Places ─────────────────────────────────────────────

const GOOGLE_SEARCH_TYPES = [
  "restaurant", "cafe", "bar", "lodging", "hospital", "pharmacy",
  "transit_station", "park", "museum", "movie_theater", "gym",
  "shopping_mall", "school", "church", "local_government_office",
];

interface GoogleResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: { location: { lat: number; lng: number } };
  types: string[];
}

interface GoogleResponse {
  results: GoogleResult[];
  next_page_token?: string;
  status: string;
}

async function fetchGoogleVenues(city: string, state: string, apiKey: string): Promise<VenueInsert[]> {
  const allResults: GoogleResult[] = [];

  for (const type of GOOGLE_SEARCH_TYPES) {
    const base =
      `https://maps.googleapis.com/maps/api/place/textsearch/json` +
      `?query=${encodeURIComponent(`${type} in ${city} ${state}`)}` +
      `&type=${type}&key=${apiKey}`;

    let url: string | null = base;
    let pages = 0;

    while (url && pages < 3) {
      if (pages > 0) {
        // Google requires ≥2 s before a pagetoken is valid
        await new Promise((r) => setTimeout(r, 2200));
      }

      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`  Google Places HTTP error ${res.status} for type=${type}`);
        break;
      }

      const data = (await res.json()) as GoogleResponse;

      if (data.status === "REQUEST_DENIED" || data.status === "INVALID_REQUEST") {
        console.error(`  Google Places: ${data.status} - check your API key and billing.`);
        return allResults.map(toVenueInsert).filter(Boolean) as VenueInsert[];
      }

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        console.warn(`  Google Places: status=${data.status} for type=${type}`);
        break;
      }

      allResults.push(...(data.results ?? []));
      url = data.next_page_token ? `${base}&pagetoken=${data.next_page_token}` : null;
      pages++;
    }

    process.stdout.write(`  Google: fetched type=${type} (${allResults.length} total so far)\r`);
  }

  console.log(`\n  Google: ${allResults.length} raw results`);

  // Deduplicate by place_id
  const seen = new Set<string>();
  const unique = allResults.filter((r) => {
    if (seen.has(r.place_id)) return false;
    seen.add(r.place_id);
    return true;
  });

  return unique.map(toVenueInsert).filter(Boolean) as VenueInsert[];
}

function toVenueInsert(place: GoogleResult): VenueInsert | null {
  const category = googleCategory(place.types);
  if (!category) return null;

  // Parse "123 Main St, Brooklyn, NY 11201, USA"
  const parts = place.formatted_address.split(",").map((s) => s.trim());
  const n = parts.length;
  // Last part: country; second-to-last: "ST ZIP"; third-to-last: city
  const stateZip = n >= 2 ? parts[n - 2] : null;
  const cityPart = n >= 3 ? parts[n - 3] : null;
  const addressPart = n >= 4 ? parts.slice(0, n - 3).join(", ") : null;

  const stateCode = stateZip?.match(/^([A-Z]{2})\b/)?.[1] ?? null;

  return {
    name: place.name.trim().slice(0, 200),
    category,
    address: addressPart,
    city: cityPart,
    state: stateCode,
    country: "US",
    phone: null,
    website: null,
    google_place_id: place.place_id,
    location: `POINT(${place.geometry.location.lng} ${place.geometry.location.lat})`,
    import_source: "google_places",
  };
}

// ── Supabase insert (skip-existing) ──────────────────────────

const BATCH = 50;

async function insertOSM(venues: VenueInsert[]): Promise<number> {
  if (!venues.length) return 0;

  const osmIds = venues.map((v) => v.osm_id!);

  // Find which osm_ids already exist
  const { data: existing } = await supabase
    .from("venues")
    .select("osm_id")
    .in("osm_id", osmIds);

  const existingSet = new Set((existing ?? []).map((r) => r.osm_id));
  const fresh = venues.filter((v) => !existingSet.has(v.osm_id!));

  if (!fresh.length) {
    console.log("  OSM: all records already exist - nothing to insert.");
    return 0;
  }

  let inserted = 0;
  for (let i = 0; i < fresh.length; i += BATCH) {
    const batch = fresh.slice(i, i + BATCH);
    const { data, error } = await supabase.from("venues").insert(batch).select("id");
    if (error) {
      console.error(`  OSM batch ${Math.floor(i / BATCH) + 1} error:`, error.message);
    } else {
      inserted += data?.length ?? 0;
    }
  }
  return inserted;
}

async function insertGoogle(venues: VenueInsert[]): Promise<number> {
  if (!venues.length) return 0;

  const placeIds = venues.map((v) => v.google_place_id!);

  const { data: existing } = await supabase
    .from("venues")
    .select("google_place_id")
    .in("google_place_id", placeIds);

  const existingSet = new Set((existing ?? []).map((r) => r.google_place_id));
  const fresh = venues.filter((v) => !existingSet.has(v.google_place_id!));

  if (!fresh.length) {
    console.log("  Google: all records already exist - nothing to insert.");
    return 0;
  }

  let inserted = 0;
  for (let i = 0; i < fresh.length; i += BATCH) {
    const batch = fresh.slice(i, i + BATCH);
    const { data, error } = await supabase.from("venues").insert(batch).select("id");
    if (error) {
      console.error(`  Google batch ${Math.floor(i / BATCH) + 1} error:`, error.message);
    } else {
      inserted += data?.length ?? 0;
    }
  }
  return inserted;
}

// ── Main ──────────────────────────────────────────────────────

async function main() {
  console.log(`\nAccessana venue seed - ${CITY}, ${STATE} (source: ${SOURCE})\n`);

  const bbox = await getCityBbox(CITY, STATE);

  let osmInserted = 0;
  let googleInserted = 0;

  // ── OSM ──────────────────────────────────────────────────
  if (SOURCE === "osm" || SOURCE === "both") {
    console.log("\nFetching from OpenStreetMap Overpass API…");
    const osmVenues = await fetchOSMVenues(bbox);
    console.log(`  OSM: ${osmVenues.length} venues mapped`);
    osmInserted = await insertOSM(osmVenues);
    console.log(`  OSM: inserted ${osmInserted} new venues`);
  }

  // ── Google Places ─────────────────────────────────────────
  if ((SOURCE === "google" || SOURCE === "both") && GOOGLE_KEY) {
    console.log("\nFetching from Google Places API…");
    const googleVenues = await fetchGoogleVenues(CITY, STATE, GOOGLE_KEY);
    console.log(`  Google: ${googleVenues.length} venues mapped`);
    googleInserted = await insertGoogle(googleVenues);
    console.log(`  Google: inserted ${googleInserted} new venues`);
  }

  console.log(`\n✅  Done. Total inserted: ${osmInserted + googleInserted}`);
  console.log(`   OSM: ${osmInserted}  |  Google Places: ${googleInserted}\n`);
}

main().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
