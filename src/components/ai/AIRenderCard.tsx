"use client";
import { useAIRender } from "@/hooks/useAIRender";
import { useState } from "react";

export default function AIRenderCard({ context }: { context: string }) {
  const [layoutType, setLayoutType] = useState<"2D" | "3D">("2D");
  const { loading, renderData, generateRender } = useAIRender();

  return (
    <div className="p-4 border rounded-lg shadow bg-white dark:bg-neutral-900">
      <h2 className="text-xl font-semibold mb-2">AI Render Generator ({context})</h2>
      <select
        onChange={(e) => setLayoutType(e.target.value as "2D" | "3D")}
        className="p-2 border rounded mb-3 w-full"
      >
        <option value="2D">2D Layout</option>
        <option value="3D">3D Model</option>
      </select>
      <button
        onClick={() => generateRender(layoutType, context)}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Render"}
      </button>

      {renderData && (
        <div className="mt-3 text-sm border rounded p-3 bg-neutral-50 dark:bg-neutral-800">
          <p>{renderData.message}</p>
          <p className="mt-2 text-blue-600">Output: {renderData.url}</p>
        </div>
      )}
    </div>
  );
}
