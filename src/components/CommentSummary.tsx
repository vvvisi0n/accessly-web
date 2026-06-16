"use client";

import { useEffect, useState } from "react";

export default function CommentSummary({ reviewId }: { reviewId: string }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      const res = await fetch("/api/summarizeComments", {
        method: "POST",
        body: JSON.stringify({ reviewId }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      setSummary(data.summary || "No summary available.");
      setLoading(false);
    };

    fetchSummary();
  }, [reviewId]);

  return (
    <div className="bg-gray-50 border rounded p-3 mt-4">
      <p className="font-semibold mb-1">🧠 Summary of Comments</p>
      {loading ? (
        <p className="text-sm text-gray-500">Generating summary...</p>
      ) : (
        <p className="text-sm text-gray-700 whitespace-pre-line">{summary}</p>
      )}
    </div>
  );
}
