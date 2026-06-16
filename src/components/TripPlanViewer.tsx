"use client";

import { useState, useRef, useEffect } from "react";
import type { TravelPlanResponse } from "@/types/ai";
import ItineraryTimeline from "./ItineraryTimeline";

interface Props {
  planData: TravelPlanResponse;
  onSelectPlace?: (id: string) => void;
  highlightedPlaceId?: string;
}

export default function TripPlanViewer({ planData, onSelectPlace, highlightedPlaceId }: Props) {
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const [recentHighlight, setRecentHighlight] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<number>(1);

  // Auto-scroll to highlighted item
  useEffect(() => {
    if (highlightedPlaceId && itemRefs.current[highlightedPlaceId]) {
      const el = itemRefs.current[highlightedPlaceId]!;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setRecentHighlight(highlightedPlaceId);
      const timeout = setTimeout(() => setRecentHighlight(null), 2000);
      return () => clearTimeout(timeout);
    }
  }, [highlightedPlaceId]);

  if (!planData?.plan?.length) return null;

  const days = planData.plan.map((d) => ({
    day: d.day,
    summary: d.summary,
  }));

  const currentDay = planData.plan.find((d) => d.day === activeDay);

  return (
    <div className="mt-4 space-y-4">
      <h3 className="text-lg font-semibold mb-2">🧭 Accessible Trip Plan — {planData.city}</h3>

      {/* Horizontal timeline */}
      <ItineraryTimeline
        days={days}
        activeDay={activeDay}
        onSelectDay={(day) => setActiveDay(day)}
      />

      {/* Current day’s itinerary */}
      {currentDay && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-bold mb-2">Day {currentDay.day}</h4>
          <p className="text-sm mb-3 text-gray-600">{currentDay.summary}</p>

          <ul className="text-sm space-y-1">
            {currentDay.items.map((it, idx) => (
              <li
                key={idx}
                ref={(el) => (itemRefs.current[it.id || it.title] = el)}
                className={`flex gap-2 cursor-pointer rounded-md px-1 py-0.5 transition ${
                  recentHighlight === (it.id || it.title)
                    ? "bg-yellow-200 border border-yellow-400"
                    : "hover:bg-blue-100"
                }`}
                onClick={() => onSelectPlace?.(it.id || it.title)}
                title={`Locate ${it.title} on map`}
              >
                <span className="text-blue-600 font-semibold w-16">{it.time}</span>
                <span>{it.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
