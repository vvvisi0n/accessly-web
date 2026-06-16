"use client";
import { useAIScan } from "@/hooks/useAIScan";
import { useState } from "react";

export default function AIScanCard({ context }: { context: string }) {
  const [area, setArea] = useState("");
  const { loading, result, runScan } = useAIScan();

  return (
    <div className="p-4 border rounded-lg shadow bg-white dark:bg-neutral-900">
      <h2 className="text-xl font-semibold mb-2">AI Scan ({context})</h2>
      <input
        placeholder="Enter area to scan..."
        value={area}
        onChange={(e) => setArea(e.target.value)}
        className="p-2 border rounded w-full"
      />
      <button
        onClick={() => runScan(area, context)}
        disabled={loading}
        className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Scanning..." : "Run Scan"}
      </button>

      {result && (
        <div className="mt-3 text-sm border rounded p-3 bg-neutral-50 dark:bg-neutral-800">
          <p>
            <strong>Summary:</strong> {result.summary}
          </p>
          <p>
            <strong>Issues:</strong>
          </p>
          <ul className="list-disc pl-5">
            {result.issues.map((i: string, idx: number) => (
              <li key={idx}>{i}</li>
            ))}
          </ul>
          <p>
            <strong>Score:</strong> {result.score}%
          </p>
        </div>
      )}
    </div>
  );
}
