import React from "react";
import { CrowdReport } from "@/hooks/useCrowdReports";

export default function HazardPanel({ reports }: { reports: CrowdReport[] }) {
  if (!reports?.length) return null;
  return (
    <div className="text-xs border border-amber-300 bg-amber-50 rounded-md p-2 mb-2">
      <div className="font-medium mb-1">⚠ Nearby hazards</div>
      <ul className="space-y-1 max-h-40 overflow-auto">
        {reports.slice(0, 6).map((r) => (
          <li key={r.id} className="flex items-center justify-between">
            <span>
              {r.type.replace("_", " ")} — {new Date(r.createdAt).toLocaleTimeString()}
            </span>
            <span className="opacity-60">
              {r.lat.toFixed(3)}, {r.lng.toFixed(3)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
