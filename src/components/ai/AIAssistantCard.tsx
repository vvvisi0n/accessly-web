"use client";
import { useAIAssist } from "@/hooks/useAIAssist";
import { useState } from "react";

export default function AIAssistantCard({ context }: { context: string }) {
  const [question, setQuestion] = useState("");
  const { loading, answer, askAI } = useAIAssist();

  return (
    <div className="p-4 border rounded-lg shadow bg-white dark:bg-neutral-900">
      <h2 className="text-xl font-semibold mb-2">AI Compliance Assistant ({context})</h2>
      <textarea
        placeholder="Ask an ADA or WCAG question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="p-2 border rounded w-full"
      />
      <button
        onClick={() => askAI(question, context)}
        disabled={loading}
        className="mt-3 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? "Thinking..." : "Ask AI"}
      </button>

      {answer && (
        <div className="mt-3 text-sm border rounded p-3 bg-neutral-50 dark:bg-neutral-800 whitespace-pre-line">
          {answer}
        </div>
      )}
    </div>
  );
}
