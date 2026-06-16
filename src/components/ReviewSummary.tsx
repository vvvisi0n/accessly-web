// src/components/ReviewSummary.tsx
"use client";

import { useEffect, useState } from "react";

interface Props {
  reviewText: string;
}

export default function ReviewSummary({ reviewText }: Props) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch("/api/ai/summarize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reviewText }),
        });

        const data = await res.json();
        if (data.summary) {
          setSummary(data.summary);
        } else {
          setSummary("Could not summarize this review.");
        }
      } catch (err) {
        console.error("Error fetching summary:", err);
        setSummary("Error loading summary.");
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [reviewText]);

  return (
    <div className="mt-2 text-sm italic text-gray-600">
      {loading ? "Summarizing..." : `🧠 ${summary}`}
    </div>
  );
}
