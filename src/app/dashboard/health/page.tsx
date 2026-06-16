"use client";
import ComplianceCard from "@/components/enterprise/ComplianceCard";

export default function HealthPage() {
  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-blue-700">🏥 Health (Hospitals & Clinics)</h1>
      <p className="text-gray-600">AI-assisted compliance checks and printable reports.</p>
      <div className="grid md:grid-cols-3 gap-4">
        <ComplianceCard
          title="Entrances & Ramps"
          score={86}
          items={["Automatic doors", "Ramp gradient OK", "Handrails present"]}
        />
        <ComplianceCard
          title="Wayfinding"
          score={64}
          items={["Add tactile signage", "Improve contrast", "Map kiosks needed"]}
        />
        <ComplianceCard
          title="Restrooms"
          score={58}
          items={["Stall width checks", "Grab bars audit", "Door swing clearances"]}
        />
      </div>
    </main>
  );
}
