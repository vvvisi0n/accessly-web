"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import AIRevenueInsights from "./AIRevenueInsights";

// ...inside your JSX return:
<AIRevenueInsights />;

type StripeEvent = {
  id: string;
  type: string;
  createdAt: any;
  amount_total?: number;
};

function computeWoWGrowth(values: { date: string; revenue: number }[]) {
  // Simple last-7 vs previous-7 comparison
  const byIdx = values.slice(-14);
  const prev7 = byIdx.slice(0, 7).reduce((a, b) => a + b.revenue, 0);
  const last7 = byIdx.slice(-7).reduce((a, b) => a + b.revenue, 0);
  const growth = prev7 ? ((last7 - prev7) / prev7) * 100 : last7 ? 100 : 0;
  return { last7, prev7, growth: Math.round(growth * 10) / 10 };
}

export default function StripeAnalytics() {
  const [events, setEvents] = useState<StripeEvent[]>([]);

  useEffect(() => {
    const q = query(collection(db, "stripe_logs"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as StripeEvent[];
      setEvents(data);
    });
    return () => unsubscribe();
  }, []);

  // Compute revenue summary
  const revenueData = events
    .filter((e) => e.type === "invoice.payment_succeeded")
    .map((e) => ({
      date: e.createdAt?.toDate ? e.createdAt.toDate().toLocaleDateString() : "Unknown",
      revenue: (e as any).data?.amount_paid ? (e as any).data.amount_paid / 100 : 0,
    }))
    .reverse();

  const wow = computeWoWGrowth(revenueData.map((d) => ({ date: d.date, revenue: d.revenue })));

  const subscriptionCount = events.filter((e) => e.type === "customer.subscription.created").length;

  return (
    <div className="space-y-8">
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl shadow-sm">
          <h3 className="text-sm text-gray-600 dark:text-gray-300">Active Subscriptions</h3>
          <p className="text-2xl font-semibold">{subscriptionCount}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-xl shadow-sm">
          <h3 className="text-sm text-gray-600 dark:text-gray-300">Total Logged Events</h3>
          <p className="text-2xl font-semibold">{events.length}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-xl shadow-sm">
          <h3 className="text-sm text-gray-600 dark:text-gray-300">Last Update</h3>
          <p className="text-lg">
            {events[0]?.createdAt?.toDate ? events[0].createdAt.toDate().toLocaleString() : "—"}
          </p>
        </div>
      </div>

      {/* Revenue chart */}
      <section>
        <h2 className="text-xl font-medium mb-3">💰 Revenue Over Time</h2>
        <div className="h-64 bg-white dark:bg-gray-900 rounded-lg p-4 shadow">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Event breakdown */}
      <section>
        <h2 className="text-xl font-medium mb-3">📦 Event Type Breakdown</h2>
        <div className="h-64 bg-white dark:bg-gray-900 rounded-lg p-4 shadow">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={Object.values(
                events.reduce(
                  (acc, cur) => {
                    acc[cur.type] = acc[cur.type] || { name: cur.type, count: 0 };
                    acc[cur.type].count += 1;
                    return acc;
                  },
                  {} as Record<string, { name: string; count: number }>
                )
              )}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
