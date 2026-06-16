"use client";
import AIAnalyticsCard from "@/components/analytics/AIAnalyticsCard";
import AIScanCard from "@/components/ai/AIScanCard";
import AIAssistantCard from "@/components/ai/AIAssistantCard";
import AIRenderCard from "@/components/ai/AIRenderCard";
import { useState } from "react";

export default function TravelDashboard() {
  const [destination, setDestination] = useState("");
  const [tripPlan, setTripPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateItinerary = async () => {
    setLoading(true);
    const res = await fetch("/api/travel/planner", {
      method: "POST",
      body: JSON.stringify({ destination }),
    });
    const data = await res.json();
    setTripPlan(data);
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-blue-600">Accessly Travel Dashboard</h1>
      <div className="p-4 border rounded-lg bg-white dark:bg-neutral-900 shadow">
        <h2 className="text-lg font-semibold mb-2">AI Travel Planner</h2>
        <input
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Enter your destination..."
          className="p-2 border rounded w-full"
        />
        <button
          onClick={generateItinerary}
          disabled={loading}
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Planning..." : "Generate Accessible Itinerary"}
        </button>
        {tripPlan && (
          <div className="mt-4 p-3 border rounded bg-neutral-50 dark:bg-neutral-800">
            <h3 className="font-semibold mb-1">AI Suggested Plan:</h3>
            <ul className="list-disc pl-5">
              {tripPlan.itinerary.map((stop: string, idx: number) => (
                <li key={idx}>{stop}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <AIScanCard context="Travel" />
        <AIAssistantCard context="Travel" />
        <AIRenderCard context="Travel" />
        <AIAnalyticsCard context="Travel" />
      </div>
    </div>
  );
}
