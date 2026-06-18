"use client";
import { useState } from "react";
import { useChatbot } from "@/hooks/useChatbot";
import AccessibleMap from "@/components/map/AccessibleMap";

export default function ChatUI() {
  const { messages, sendMessage, loading } = useChatbot();
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[80vh] w-full max-w-2xl mx-auto p-4 bg-white rounded-2xl shadow-md border">
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length > 0 &&
          messages[messages.length - 1].content.toLowerCase().includes("wheelchair") && (
            <AccessibleMap query={messages[messages.length - 1].content} />
          )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl ${
              m.role === "user" ? "bg-blue-100 self-end" : "bg-gray-100 self-start"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && <p className="text-sm text-neutral-400">Thinking...</p>}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Accessana AI..."
          className="flex-1 p-2 border rounded-lg"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
