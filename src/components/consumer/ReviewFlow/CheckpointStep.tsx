import type { CheckpointKey } from "@/types";

export interface CheckpointStepProps {
  checkpoint: CheckpointKey;
  value: number | null;
  note: string;
  photos: File[];
  skippable?: boolean;
  onChange: (value: number, note: string) => void;
  onPhotos: (files: File[]) => void;
}

export default function CheckpointStep(_props: CheckpointStepProps) {
  return null;
}
