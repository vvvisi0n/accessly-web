import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { DisabilityType } from "@/types";

interface ReviewBody {
  venue_id: string;
  disability_types: DisabilityType[];
  score_entrance?: number | null;
  score_bathrooms?: number | null;
  score_parking?: number | null;
  score_staff?: number | null;
  score_sensory?: number | null;
  note_entrance?: string;
  note_bathrooms?: string;
  note_parking?: string;
  note_staff?: string;
  note_sensory?: string;
  photos_entrance?: string[];
  photos_bathrooms?: string[];
  photos_parking?: string[];
  photos_staff?: string[];
  photos_sensory?: string[];
  overall_comment?: string;
  visit_date: string;
}

function validateScore(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const n = Number(val);
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: ReviewBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // ── Validation ────────────────────────────────────────────────────────
  if (!body.venue_id) {
    return NextResponse.json({ error: "venue_id is required" }, { status: 400 });
  }
  if (!body.visit_date) {
    return NextResponse.json({ error: "visit_date is required" }, { status: 400 });
  }

  const scores = {
    score_entrance: validateScore(body.score_entrance),
    score_bathrooms: validateScore(body.score_bathrooms),
    score_parking: validateScore(body.score_parking),
    score_staff: validateScore(body.score_staff),
    score_sensory: validateScore(body.score_sensory),
  };

  const hasAtLeastOneScore = Object.values(scores).some((s) => s !== null);
  if (!hasAtLeastOneScore) {
    return NextResponse.json(
      { error: "At least one checkpoint score is required" },
      { status: 400 }
    );
  }

  // ── Insert review ─────────────────────────────────────────────────────
  const { data: review, error: insertError } = await supabase
    .from("reviews")
    .insert({
      venue_id: body.venue_id,
      user_id: user.id,
      disability_types: body.disability_types ?? [],
      ...scores,
      note_entrance: body.note_entrance ?? null,
      note_bathrooms: body.note_bathrooms ?? null,
      note_parking: body.note_parking ?? null,
      note_staff: body.note_staff ?? null,
      note_sensory: body.note_sensory ?? null,
      photos_entrance: body.photos_entrance ?? [],
      photos_bathrooms: body.photos_bathrooms ?? [],
      photos_parking: body.photos_parking ?? [],
      photos_staff: body.photos_staff ?? [],
      photos_sensory: body.photos_sensory ?? [],
      overall_comment: body.overall_comment ?? null,
      visit_date: body.visit_date,
    })
    .select()
    .single();

  if (insertError) {
    // Unique constraint: user already reviewed this venue on this date.
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "You have already submitted a review for this venue on that date" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // ── Increment review counts ───────────────────────────────────────────
  // These are best-effort; the Access Index edge function recalculates
  // venue.review_count from the authoritative row count on every insert.
  await Promise.all([
    supabase.rpc("increment_venue_review_count", { venue_id: body.venue_id }),
    supabase.rpc("increment_user_review_count", { user_id: user.id }),
  ]).catch(() => {
    // RPC functions not available until migration is applied — non-fatal.
  });

  // ── Trigger Access Index recalculation ────────────────────────────────
  // The Supabase database webhook fires the edge function automatically.
  // Direct invocation here is a belt-and-suspenders fallback for local dev.
  supabase.functions
    .invoke("calculate-access-index", {
      body: {
        type: "INSERT",
        table: "reviews",
        schema: "public",
        record: review,
        old_record: null,
      },
    })
    .catch(() => {
      // Edge function not deployed yet — non-fatal during local development.
    });

  return NextResponse.json({ review }, { status: 201 });
}
