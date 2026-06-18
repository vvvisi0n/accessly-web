import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { AccessIndexBreakdown } from "@/types";

export async function GET(req: NextRequest) {
  const venueId = req.nextUrl.searchParams.get("venueId");
  if (!venueId) {
    return NextResponse.json({ error: "venueId is required" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("venues")
    .select(
      "access_index, score_entrance, score_bathrooms, score_parking, score_staff, score_sensory, review_count"
    )
    .eq("id", venueId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return null breakdown when venue has no score yet.
  if (data.access_index === null) {
    return NextResponse.json({ breakdown: null });
  }

  const breakdown: AccessIndexBreakdown = {
    overall: data.access_index,
    entrance: data.score_entrance ?? 0,
    bathrooms: data.score_bathrooms ?? 0,
    parking: data.score_parking ?? 0,
    staff: data.score_staff ?? 0,
    sensory: data.score_sensory ?? 0,
    review_count: data.review_count,
  };

  return NextResponse.json({ breakdown });
}
