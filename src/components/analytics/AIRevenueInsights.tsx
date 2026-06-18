"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

/**
 * Accessana AI Revenue Insights (Secure)
 * -------------------------------------
 * This version calls the backend API route for AI processing.
 * No API keys are exposed to the frontend.
 */

export default function AIRevenueInsights() {
  const [events, setEvents] = useState<any[]>([]);
  const [insight, setInsight] = useState("Analyzing data...");
  const [loading, setLoading] = useState(false);

  // Realtime Firestore listener for Stripe logs
  useEffect(() => {
    const q = query(collection(db, "stripe_logs"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(data);
    });
    return () => unsub();
  }, []);

  // Calls backend AI API route securely
  const generateInsights = async () => {
    if (!events.length) return;
    setLoading(true);

    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events }),
      });

      const data = await res.json();
      setInsight(data.insight || "⚠️ No insights generated.");
    } catch (err) {
      console.error("AI Insight error:", err);
      setInsight("⚠️ Failed to generate insights.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-run on data load
  useEffect(() => {
    if (events.length > 0) {
      generateInsights();
    }
  }, [events]);

  return (
    <section className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow mt-8">
      <h2 className="text-xl font-semibold mb-3">🤖 AI Revenue Insights</h2>

      {loading ? (
        <p className="text-gray-500 animate-pulse">Generating insights...</p>
      ) : (
        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">{insight}</p>
      )}

      <button
        onClick={generateInsights}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        🔄 Refresh Insights
      </button>
    </section>
  );
}
