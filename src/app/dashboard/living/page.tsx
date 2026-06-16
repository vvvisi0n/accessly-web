"use client";
import ComplianceCard from "@/components/enterprise/ComplianceCard";

export default function LivingPage() {
  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-blue-700">🏢 Living (Property Management)</h1>
      <p className="text-gray-600">Plan accommodations for residents and track upgrades.</p>
      <div className="grid md:grid-cols-3 gap-4">
        <ComplianceCard
          title="Unit Modifications"
          score={72}
          items={["Door widening", "Lowered counters", "Lever handles"]}
        />
        <ComplianceCard
          title="Common Areas"
          score={67}
          items={["Ramp fix", "Elevator maintenance", "Signage contrast"]}
        />
        <ComplianceCard
          title="Resident Requests"
          score={80}
          items={["2 pending", "3 completed this week", "SLA 48h"]}
        />
      </div>
    </main>
  );
}
