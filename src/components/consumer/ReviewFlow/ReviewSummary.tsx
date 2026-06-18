import type { ReviewDraft } from "@/types";

export interface ReviewSummaryProps {
  draft: ReviewDraft;
  onEdit: (step: number) => void;
  onSubmit: () => void;
  submitting: boolean;
}

export default function ReviewSummary(_props: ReviewSummaryProps) {
  return null;
}
