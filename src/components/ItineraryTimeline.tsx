"use client";

import { useEffect, useRef } from "react";

interface ItineraryTimelineProps {
  days: { day: number; summary: string }[];
  activeDay: number;
  onSelectDay: (day: number) => void;
}

export default function ItineraryTimeline({
  days,
  activeDay,
  onSelectDay,
}: ItineraryTimelineProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    const activeButton = scrollRef.current.querySelector(`[data-day="${activeDay}"]`);
    if (activeButton instanceof HTMLElement) {
      activeButton.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeDay]);

  return (
    <div className="overflow-x-auto scrollbar-hide mb-3">
      <div ref={scrollRef} className="flex space-x-3 py-2 px-1">
        {days.map((d) => (
          <button
            key={d.day}
            data-day={d.day}
            onClick={() => onSelectDay(d.day)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${
              activeDay === d.day
                ? "bg-blue-600 text-white border-blue-600 scale-105 shadow-md"
                : "bg-white border-gray-300 text-gray-700 hover:bg-blue-100"
            }`}
          >
            Day {d.day}
          </button>
        ))}
      </div>
    </div>
  );
}
