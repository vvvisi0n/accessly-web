"use client";
import { useAIInsights } from "@/hooks/useAIInsights";

export default function AIInsightsCard({ context }: { context: string }) {
  const { loading, insight, generateInsights } = useAIInsights();

  return (
    <div className="p-4 border rounded-lg shadow bg-white dark:bg-neutral-900">
      <h2 className="text-xl font-semibold mb-2">AI Insights ({context})</h2>

      <button
        onClick={() => generateInsights(context)}
        disabled={loading}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Generate Insights"}
      </button>

      {insight && (
        <div className="mt-4 text-sm space-y-3">
          <p className="font-medium text-neutral-800 dark:text-neutral-200">{insight.summary}</p>
          <div>
            <p className="font-semibold">Recommended Actions:</p>
            <ul className="list-disc pl-5">
              {insight.recommendations.map((r: string, i: number) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-neutral-500">
            Generated: {new Date(insight.generatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
