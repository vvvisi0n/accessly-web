import type { CivicReport } from "@/types";

export function useCivicReports(_cityId?: string): {
  reports: CivicReport[];
  loading: boolean;
  error: string | null;
} {
  return { reports: [], loading: false, error: null };
}
