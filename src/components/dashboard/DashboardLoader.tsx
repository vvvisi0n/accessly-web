"use client";
import { dashboardMap } from "@/config/dashboardMap";

export default function DashboardLoader({ role }: { role: string }) {
  const components = dashboardMap[role] || [];
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 p-6">
      {components.map((Component, idx) => (
        <div key={idx} className="col-span-1">
          <Component context={role} findings={["Door width", "Ramp slope", "Signage missing"]} />
        </div>
      ))}
    </div>
  );
}
