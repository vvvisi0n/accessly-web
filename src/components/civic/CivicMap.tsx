import type { CivicReport } from "@/types";

export interface CivicMapProps {
  reports: CivicReport[];
  onReportSelect: (report: CivicReport) => void;
}

export default function CivicMap(_props: CivicMapProps) {
  return null;
}
