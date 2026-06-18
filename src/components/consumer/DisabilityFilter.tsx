import type { DisabilityType } from "@/types";

export interface DisabilityFilterProps {
  selected: DisabilityType[];
  onChange: (types: DisabilityType[]) => void;
}

export default function DisabilityFilter(_props: DisabilityFilterProps) {
  return null;
}
