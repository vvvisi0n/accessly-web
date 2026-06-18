import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { VenueCategory } from "@/types";

// ── GET /api/venues ───────────────────────────────────────────────────────
// Query params:
//   city        string   filter by city (exact, case-insensitive)
//   category    string   venue_category enum value
//   minScore    number   minimum access_index
//   limit       number   max results (default 40, max 100)
//   offset      number   pagination offset

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
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
        "review_count, claimed, verified, certified, photos"
    )
    .order("access_index", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  if (city) query = query.ilike("city", city);
  if (category) query = query.eq("category", category);
  if (minScore !== undefined) query = query.gte("access_index", minScore);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ venues: data ?? [], total: count ?? 0 });
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
