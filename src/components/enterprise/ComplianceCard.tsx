// src/components/enterprise/ComplianceCard.tsx
"use client";
import React from "react";

interface ComplianceCardProps {
  title: string;
  score: number;
  items: string[];
}

export default function ComplianceCard({ title, score, items }: ComplianceCardProps) {
  // Color indicator based on score
  const getScoreColor = (score: number) => {
    if (score >= 85) return "bg-green-100 text-green-700";
    if (score >= 65) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="p-4 border rounded-xl shadow-sm bg-white dark:bg-gray-900 dark:border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
        <span className={`text-sm font-bold px-3 py-1 rounded-full ${getScoreColor(score)}`}>
          {score}%
        </span>
      </div>

      <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 text-sm space-y-1">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
