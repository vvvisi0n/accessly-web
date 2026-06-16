"use client";
import { useAIReport } from "@/hooks/useAIReport";

export default function AIReportCard({
  context,
  findings,
}: {
  context: string;
  findings: string[];
}) {
  const { loading, report, generateReport } = useAIReport();

  return (
    <div className="p-4 border rounded-lg shadow bg-white dark:bg-neutral-900">
      <h2 className="text-xl font-semibold mb-2">AI Report Generator ({context})</h2>
      <button
        onClick={() => generateReport(context, findings)}
        disabled={loading}
        className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Report"}
      </button>

      {report && (
        <div className="mt-3 text-sm border rounded p-3 bg-neutral-50 dark:bg-neutral-800">
          <h3 className="font-semibold">{report.title}</h3>
          <p>{report.summary}</p>
          <ul className="list-disc pl-5">
            {report.recommendations.map((r: string, i: number) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
