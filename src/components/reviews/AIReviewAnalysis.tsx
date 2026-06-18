"use client";

import jsPDF from "jspdf";
import "jspdf-autotable";

interface AIReviewAnalysisProps {
  aiAnalysis?: {
    summary?: string;
    accessibility_features?: string[];
    issues_detected?: string[];
    score?: number;
  };
  placeName?: string;
  imageUrl?: string;
}

export default function AIReviewAnalysis({
  aiAnalysis,
  placeName,
  imageUrl,
}: AIReviewAnalysisProps) {
  if (!aiAnalysis) {
    return (
      <div className="p-3 text-sm text-gray-500 italic">
        No AI analysis available for this review.
      </div>
    );
  }

  const { summary, accessibility_features, issues_detected, score = 50 } = aiAnalysis;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-700";
    if (score >= 50) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Highly Accessible";
    if (score >= 50) return "Partially Accessible";
    return "Not Accessible";
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(`Accessana AI Accessibility Report`, 14, 16);
    doc.text(`Location: ${placeName || "Unknown"}`, 14, 24);
    doc.text(`Accessibility Score: ${score}/100`, 14, 32);

    if (imageUrl) doc.text(`Photo: ${imageUrl}`, 14, 40);

    doc.text(`Summary:`, 14, 50);
    doc.text(summary || "No summary available.", 20, 58, { maxWidth: 170 });

    const featureRows = (accessibility_features || []).map((f) => [f]);
    const issueRows = (issues_detected || []).map((i) => [i]);

    if (featureRows.length) {
      (doc as any).autoTable({
        startY: 78,
        head: [["Accessibility Features"]],
        body: featureRows,
      });
    }

    if (issueRows.length) {
      (doc as any).autoTable({
        startY: doc.lastAutoTable.finalY + 10 || 100,
        head: [["Issues Detected"]],
        body: issueRows,
      });
    }

    doc.save(`Accessana_AI_Report_${Date.now()}.pdf`);
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-blue-700 text-sm">AI Accessibility Analysis</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getScoreColor(score)}`}>
          {getScoreLabel(score)} ({score}/100)
        </span>
      </div>

      {summary && (
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{summary}</p>
      )}

      {accessibility_features && accessibility_features.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-green-600 mb-1">Features Detected:</p>
          <div className="flex flex-wrap gap-2">
            {accessibility_features.map((f, i) => (
              <span
                key={i}
                className="bg-green-100 text-green-800 px-2 py-1 rounded-lg text-xs font-medium"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {issues_detected && issues_detected.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-red-600 mb-1">Issues Detected:</p>
          <div className="flex flex-wrap gap-2">
            {issues_detected.map((i, idx) => (
              <span
                key={idx}
                className="bg-red-100 text-red-700 px-2 py-1 rounded-lg text-xs font-medium"
              >
                {i}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2">
        <button
          onClick={generatePDF}
          className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700"
        >
          🧾 Download AI Report
        </button>
      </div>
    </div>
  );
}
