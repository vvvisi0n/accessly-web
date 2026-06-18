import type { DisabilityType, CheckpointKey } from "./shared";

export interface Review {
  id: string;
  venue_id: string;
  user_id: string;
  disability_types: DisabilityType[];
  score_entrance: number;
  score_bathrooms: number;
  score_parking: number;
  score_staff: number;
  score_sensory: number;
  note_entrance?: string;
  note_bathrooms?: string;
  note_parking?: string;
  note_staff?: string;
  note_sensory?: string;
  photos_entrance: string[];
  photos_bathrooms: string[];
  photos_parking: string[];
  photos_staff: string[];
  photos_sensory: string[];
  overall_comment?: string;
  visit_date: string;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export type CheckpointScore = Record<CheckpointKey, number | null>;
export type CheckpointNote = Partial<Record<CheckpointKey, string>>;
export type CheckpointPhotos = Partial<Record<CheckpointKey, File[]>>;

export interface ReviewDraft {
  venue_id: string;
  disability_types: DisabilityType[];
  scores: CheckpointScore;
  notes: CheckpointNote;
  photos: CheckpointPhotos;
  overall_comment: string;
  visit_date: string;
}
