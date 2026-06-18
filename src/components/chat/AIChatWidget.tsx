"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import useConversationalAI from "@/hooks/useConversationalAI";
import useAdaptiveVoice from "@/hooks/useAdaptiveVoice";
import useVoiceMemory from "@/hooks/useVoiceMemory";
import useSpeechToText from "@/hooks/useSpeechToText";
import useOfflineWakeWord from "@/hooks/useOfflineWakeWord";

export default function AIChatWidget({ userId = "guest" }: { userId?: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<{ from: "user" | "ai"; text: string }[]>([]);

  const { processQuery, thinking } = useConversationalAI();
  const { speak } = useAdaptiveVoice({ language: "en-US" });
  const { profiles } = useVoiceMemory(userId);
  const inputRef = useRef<HTMLInputElement>(null);

  // 🎤 Speech-to-Text
  const { transcript, listening, toggle, setTranscript } = useSpeechToText({
    onResult: (res) => {
      if (res.isFinal) {
        setMessage(res.transcript);
        sendMessage(res.transcript);
        setTranscript("");
      }
    },
  });

  // 💤 Offline Wake Word (Mock Mode)
  const { active: offlineWakeActive, error: wakeErr } = useOfflineWakeWord({
    accessKey: process.env.NEXT_PUBLIC_PICOVOICE_ACCESS_KEY!,
    onWake: () => {
      console.log("👂 Offline wake word detected — opening chat & activating mic");
      setOpen(true);
      toggle();
    },
  });

  // Auto-focus input when chat opens
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);
  // 🎧 Keyboard shortcut for mock wake trigger (Shift + Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.code === "Space") {
        e.preventDefault();
        console.log("⌨️ Shift+Space → Simulated 'Hey Accessana'");
        setOpen(true);
        toggle(); // start listening
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  // 🧠 Send message handler
  const sendMessage = async (inputMessage?: string) => {
    const text = inputMessage ?? message.trim();
    if (!text) return;
    setMessage("");
    setHistory((h) => [...h, { from: "user", text }]);

    const reply = await processQuery(text);
    setHistory((h) => [...h, { from: "ai", text: reply }]);
    speak({ text: reply, context: "response" });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* 💬 Floating Chat Icon */}
      {!open ? (
        <div className="flex flex-col items-end mb-2">
          {/* Wake mode indicator */}
          <button
            onClick={() => setOpen(true)}
            className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all"
          >
            <MessageCircle size={24} />
          </button>

          <div className="text-[10px] text-gray-500 mt-1">
            {offlineWakeActive ? "🟢 Wake mode active (mock)" : "⚪ Wake mode idle"}
            {wakeErr && <div className="text-red-500">{wakeErr}</div>}
          </div>
        </div>
      ) : (
        <div className="w-80 h-[460px] bg-white dark:bg-neutral-900 rounded-2xl shadow-lg flex flex-col overflow-hidden border border-gray-200 dark:border-neutral-800">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-neutral-700">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <MessageCircle size={18} /> Accessana AI
            </h4>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">
              <X size={18} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
            {history.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg max-w-[80%] ${
                  msg.from === "user"
                    ? "ml-auto bg-blue-600 text-white"
                    : "mr-auto bg-gray-200 dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {thinking && (
              <div className="text-xs text-blue-500 animate-pulse">Accessana is thinking…</div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-gray-200 dark:border-neutral-700 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder={listening ? "Listening…" : "Type or ask something..."}
              value={message || transcript}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 px-3 py-2 text-sm border rounded-lg dark:bg-neutral-800 dark:text-gray-100"
            />

            {/* 🎙️ Mic Button */}
            <button
              onClick={toggle}
              className={`px-3 py-2 rounded-lg transition-all ${
                listening
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-neutral-700 dark:text-gray-200"
              }`}
            >
              🎙️
            </button>

            {/* ➤ Send Button */}
            <button
              onClick={() => sendMessage()}
              disabled={!message.trim() && !transcript.trim()}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
