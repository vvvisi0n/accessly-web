export type DisabilityType = "mobility" | "vision" | "hearing" | "cognitive" | "sensory" | "other";

export type CheckpointKey = "entrance" | "bathrooms" | "parking" | "staff" | "sensory";

export interface AccessIndexBreakdown {
  overall: number;
  entrance: number;
  bathrooms: number;
  parking: number;
  staff: number;
  sensory: number;
  review_count: number;
}
