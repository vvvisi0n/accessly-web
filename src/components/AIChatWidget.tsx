"use client";

import { useState, useEffect, useRef } from "react";
import useLanguage from "@/hooks/useLanguage";
import useVoice from "@/hooks/useVoice";
import useVoiceListener from "@/hooks/useVoiceListener";

export default function AIChatWidget() {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [glow, setGlow] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { language } = useLanguage();
  const { speak } = useVoice();

  const { listening, active, startListening, stopListening, transcript } = useVoiceListener({
    onCommand: (text) => {
      console.log("🎙 Voice Command:", text);
      handleUserMessage(text);
    },
    language,
    wakeWord: "accessly",
  });

  // preload chime
  useEffect(() => {
    audioRef.current = new Audio("/sounds/wake.mp3");
  }, []);

  // play chime + start glow when listening starts
  useEffect(() => {
    if (active) {
      audioRef.current?.play().catch(() => {});
      setGlow(true);
    } else {
      setGlow(false);
    }
  }, [active]);

  async function handleUserMessage(messageText: string) {
    if (!messageText.trim()) return;
    const newMsg = { role: "user" as const, text: messageText };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, language }),
      });
      const data = await res.json();

      if (data.reply) {
        const aiMsg = { role: "ai" as const, text: data.reply };
        setMessages((prev) => [...prev, aiMsg]);
        speak(data.reply, language);
      } else {
        throw new Error("No reply from AI");
      }
    } catch (err) {
      console.error("AIChat error:", err);
      setMessages((prev) => [...prev, { role: "ai", text: "⚠️ Sorry, something went wrong." }]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-[500px] w-full max-w-md mx-auto border rounded-xl shadow-md bg-white overflow-hidden">
      {/* Header with Glow */}
      <div
        className={`flex items-center justify-between px-4 py-2 text-white transition-all duration-300 ${
          glow
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 animate-glow"
            : "bg-gradient-to-r from-blue-600 to-purple-600"
        }`}
      >
        <h2 className="text-lg font-semibold">Accessly AI Assistant</h2>
        <button
          onClick={active ? stopListening : startListening}
          className={`px-3 py-1 rounded-md text-sm font-medium transition ${
            active ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {active ? "Stop Voice" : "🎤 Start Voice"}
        </button>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg text-sm ${
              msg.role === "user"
                ? "bg-blue-100 text-gray-800 self-end"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            <strong>{msg.role === "user" ? "You: " : "Accessly: "}</strong>
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="text-gray-400 text-sm animate-pulse">Accessly is thinking…</div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Live transcript */}
      {transcript && (
        <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 italic border-t border-gray-200">
          🎧 <span>{transcript}</span>
        </div>
      )}

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleUserMessage(input);
        }}
        className="flex items-center gap-2 p-3 border-t bg-gray-50"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            listening ? "Listening... say 'Accessly' + your request" : "Type or say something..."
          }
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
