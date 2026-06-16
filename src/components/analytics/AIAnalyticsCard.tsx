"use client";
import { useAIAnalytics } from "@/hooks/useAIAnalytics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AIAnalyticsCard({ context }: { context: string }) {
  const { loading, data } = useAIAnalytics(context);
  const COLORS = ["#4361EE", "#FFB703", "#2EC4B6", "#F72585", "#8B5CF6", "#06D6A0"];

  if (loading)
    return <div className="p-6 text-center text-neutral-600">Loading {context} analytics...</div>;
  if (!data || data.length === 0)
    return <div className="p-6 text-center text-neutral-500">No analytics data available.</div>;

  const scoreData = data.map((d) => ({ name: d.area, score: d.score }));
  const issueTypes = data
    .flatMap((d) => d.issues)
    .reduce((acc: any, issue: string) => {
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    }, {});
  const pieData = Object.entries(issueTypes).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-4 border rounded-lg shadow bg-white dark:bg-neutral-900">
      <h2 className="text-xl font-semibold mb-4">AI Analytics ({context})</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-neutral-600 mb-2">Accessibility Scores</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={scoreData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="#4361EE" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="text-sm font-medium text-neutral-600 mb-2">Common Accessibility Issues</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
