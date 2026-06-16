"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface Interaction {
  id: string;
  language: string;
  intent: string;
  timestamp: any;
}

const COLORS = ["#4361EE", "#4CC9F0", "#7209B7", "#3A0CA3", "#F72585"];

export default function InsightsPage() {
  const [logs, setLogs] = useState<Interaction[]>([]);

  useEffect(() => {
    const q = query(collection(db, "ai_logs"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Interaction[];
      setLogs(data);
    });
    return () => unsub();
  }, []);

  // ---- Grouping helpers ----
  const languageCounts = logs.reduce((acc: any, l) => {
    acc[l.language] = (acc[l.language] || 0) + 1;
    return acc;
  }, {});

  const intentCounts = logs.reduce((acc: any, l) => {
    acc[l.intent] = (acc[l.intent] || 0) + 1;
    return acc;
  }, {});

  const timeData = logs
    .map((l) => {
      if (!l.timestamp?.seconds) return null;
      const d = new Date(l.timestamp.seconds * 1000);
      const day = d.toLocaleDateString();
      return { date: day, count: 1 };
    })
    .filter(Boolean)
    .reduce((acc: any, curr: any) => {
      const existing = acc.find((x: any) => x.date === curr.date);
      if (existing) existing.count += 1;
      else acc.push(curr);
      return acc;
    }, []);

  const languageData = Object.keys(languageCounts).map((key) => ({
    name: key.toUpperCase(),
    value: languageCounts[key],
  }));

  const intentData = Object.keys(intentCounts).map((key) => ({
    name: key,
    value: intentCounts[key],
  }));

  return (
    <main className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-blue-700">📊 Accessly AI Insights</h1>
      <p className="text-gray-600 mb-4">
        Real-time analysis of user interactions with Accessly AI.
      </p>

      {/* ---- Languages ---- */}
      <section className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-2">🌍 Languages Used</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={languageData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {languageData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* ---- Intents ---- */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-2">💬 Most Common Intents</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={intentData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {intentData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ---- Activity Over Time ---- */}
      <section className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-2">📈 User Activity Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#4361EE" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* ---- Recent Logs ---- */}
      <section className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-4">🧠 Recent Conversations</h2>
        <div className="max-h-96 overflow-y-auto space-y-2">
          {logs.slice(0, 10).map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-sm"
            >
              <p>
                <strong>User:</strong> {log.language.toUpperCase()} →{" "}
                <span className="text-gray-700 dark:text-gray-300">{log.intent}</span>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Message:</strong> {log.userMessage}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
