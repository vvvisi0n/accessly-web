// Supabase Edge Function — calculate-access-index
//
// Triggered by a Supabase Database Webhook on:
//   table:  public.reviews
//   event:  INSERT
//
// To wire it up once your project is live:
//   Dashboard → Database → Webhooks → Create webhook
//     Name:    on_review_insert
//     Table:   public.reviews
//     Events:  Insert
//     URL:     https://<project-ref>.supabase.co/functions/v1/calculate-access-index
//     Headers: Authorization: Bearer <SUPABASE_ANON_KEY>

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Inline calculator (mirrors src/lib/access-index/calculator.ts) ──────────

interface ReviewRow {
  score_entrance: number | null;
  score_bathrooms: number | null;
  score_parking: number | null;
  score_staff: number | null;
  score_sensory: number | null;
  created_at: string;
  reputation_score: number;
}

const CHECKPOINTS = ["entrance", "bathrooms", "parking", "staff", "sensory"] as const;

function recencyWeight(createdAt: string): number {
  const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (days <= 30) return 1.0;
  if (days <= 90) return 0.85;
  if (days <= 180) return 0.7;
  return 0.5;
}

function reputationWeight(score: number): number {
  if (score <= 10) return 0.8;
  if (score <= 50) return 0.9;
  if (score <= 200) return 1.0;
  return 1.1;
}

function weightedAvg(pairs: Array<{ score: number | null; weight: number }>): number | null {
  const valid = pairs.filter((p): p is { score: number; weight: number } => p.score !== null);
  if (valid.length === 0) return null;
  const totalWeight = valid.reduce((s, p) => s + p.weight, 0);
  return valid.reduce((s, p) => s + p.score * p.weight, 0) / totalWeight;
}

function toCheckpointScore(avg: number): number {
  return Math.max(0, Math.min(20, (avg - 1) * 5));
}

interface AccessIndexResult {
  overall: number;
  entrance: number;
  bathrooms: number;
  parking: number;
  staff: number;
  sensory: number;
}

function calculateAccessIndex(reviews: ReviewRow[]): AccessIndexResult | null {
  if (reviews.length < 3) return null;

  const weights = reviews.map(
    (r) => recencyWeight(r.created_at) * reputationWeight(r.reputation_score)
  );

  const cpScores = CHECKPOINTS.map((cp) => {
    const key = `score_${cp}` as keyof ReviewRow;
    const pairs = reviews.map((r, i) => ({
      score: r[key] as number | null,
      weight: weights[i],
    }));
    const avg = weightedAvg(pairs);
    return avg === null ? null : toCheckpointScore(avg);
  });

  const scored = cpScores.filter((s): s is number => s !== null);
  if (scored.length === 0) return null;

  const overall = (scored.reduce((a, b) => a + b, 0) / (scored.length * 20)) * 100;

  const round1 = (n: number | null) => (n === null ? 0 : Math.round(n * 10) / 10);

  return {
    overall: Math.round(overall * 10) / 10,
    entrance: round1(cpScores[0]),
    bathrooms: round1(cpScores[1]),
    parking: round1(cpScores[2]),
    staff: round1(cpScores[3]),
    sensory: round1(cpScores[4]),
  };
}

// ── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let payload: { type: string; record: { venue_id: string; id: string } };
  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (payload.type !== "INSERT" || !payload.record?.venue_id) {
    return new Response("Unexpected payload", { status: 400 });
  }

  const venueId = payload.record.venue_id;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Fetch all reviews for the venue, joined with user reputation scores.
  const { data: rows, error: fetchError } = await supabase
    .from("reviews")
    .select(
      `score_entrance, score_bathrooms, score_parking,
       score_staff, score_sensory, created_at,
       users ( reputation_score )`
    )
    .eq("venue_id", venueId);

  if (fetchError) {
    console.error("Error fetching reviews:", fetchError);
    return new Response("Failed to fetch reviews", { status: 500 });
  }

  const reviews: ReviewRow[] = (rows ?? []).map((r) => ({
    score_entrance: r.score_entrance,
    score_bathrooms: r.score_bathrooms,
    score_parking: r.score_parking,
    score_staff: r.score_staff,
    score_sensory: r.score_sensory,
    created_at: r.created_at,
    // users is a nested object from the join; default to 0 if missing.
    reputation_score: (r.users as { reputation_score: number } | null)?.reputation_score ?? 0,
  }));

  const result = calculateAccessIndex(reviews);

  // Update the venue record with the new scores.
  const { error: updateError } = await supabase
    .from("venues")
    .update({
      access_index: result?.overall ?? null,
      score_entrance: result?.entrance ?? null,
      score_bathrooms: result?.bathrooms ?? null,
      score_parking: result?.parking ?? null,
      score_staff: result?.staff ?? null,
      score_sensory: result?.sensory ?? null,
      review_count: reviews.length,
    })
    .eq("id", venueId);

  if (updateError) {
    console.error("Error updating venue:", updateError);
    return new Response("Failed to update venue", { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true, venueId, score: result?.overall ?? null }), {
    headers: { "Content-Type": "application/json" },
  });
});
