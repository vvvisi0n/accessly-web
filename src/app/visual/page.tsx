"use client";

export const dynamic = "force-dynamic";
import AIVisualRender from "@/components/AIVisualRender";
import AIChatWidget from "@/components/chat/AIChatWidget";

export default function VisualPage() {
  const coords = { lat: 37.7749, lng: -122.4194 }; // Example: San Francisco
  const ramps = [
    { lat: 37.7753, lng: -122.4197, label: "Main entrance ramp" },
    { lat: 37.7745, lng: -122.4192, label: "Parking ramp" },
  ];
  const obstacles = [
    { lat: 37.7748, lng: -122.4195, label: "Curb obstacle" },
  ];

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">AI Visual Render Test</h1>
      <AIVisualRender mode="2D" coords={coords} ramps={ramps} obstacles={obstacles} />
      <AIVisualRender mode="3D" coords={coords} ramps={ramps} obstacles={obstacles} />
      <AIChatWidget userId="guest-001" />
    </main>
  );
}
