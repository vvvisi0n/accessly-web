import type { AccessIndexBreakdown, CheckpointKey } from "@/types";

export interface ReviewInput {
  score_entrance: number | null;
  score_bathrooms: number | null;
  score_parking: number | null;
  score_staff: number | null;
  score_sensory: number | null;
  created_at: string;
  reputation_score: number;
}

const CHECKPOINTS: CheckpointKey[] = ["entrance", "bathrooms", "parking", "staff", "sensory"];

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

// Weighted average of a set of (score, weight) pairs, or null if no valid scores.
function weightedAvg(pairs: Array<{ score: number | null; weight: number }>): number | null {
  const valid = pairs.filter((p): p is { score: number; weight: number } => p.score !== null);
  if (valid.length === 0) return null;
  const totalWeight = valid.reduce((s, p) => s + p.weight, 0);
  return valid.reduce((s, p) => s + p.score * p.weight, 0) / totalWeight;
}

// Map a 1–5 weighted average onto the 0–20 checkpoint scale.
function toCheckpointScore(avg: number): number {
  return Math.max(0, Math.min(20, (avg - 1) * 5));
}

/**
 * Calculates the Access Index for a venue from its reviews.
 *
 * Returns null when fewer than 3 reviews exist (not enough signal).
 * Scores checkpoints that have been rated at least once; scales the
 * overall to 100 proportionally so partially-reviewed venues aren't
 * unfairly penalised.
 */
export function calculateAccessIndex(reviews: ReviewInput[]): AccessIndexBreakdown | null {
  if (reviews.length < 3) return null;

  const weights = reviews.map(
    (r) => recencyWeight(r.created_at) * reputationWeight(r.reputation_score)
  );

  const cpScores = CHECKPOINTS.map((cp) => {
    const key = `score_${cp}` as keyof ReviewInput;
    const pairs = reviews.map((r, i) => ({
      score: r[key] as number | null,
      weight: weights[i],
    }));
    const avg = weightedAvg(pairs);
    return avg === null ? null : toCheckpointScore(avg);
  });

  const scored = cpScores.filter((s): s is number => s !== null);
  if (scored.length === 0) return null;

  // Scale to 100 based on the checkpoints that actually have data.
  const overall = (scored.reduce((a, b) => a + b, 0) / (scored.length * 20)) * 100;

  const round1 = (n: number | null) => (n === null ? 0 : Math.round(n * 10) / 10);

  return {
    overall: Math.round(overall * 10) / 10,
    entrance: round1(cpScores[0]),
    bathrooms: round1(cpScores[1]),
    parking: round1(cpScores[2]),
    staff: round1(cpScores[3]),
    sensory: round1(cpScores[4]),
    review_count: reviews.length,
  };
}
