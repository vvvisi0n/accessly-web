"use client";

import { useState } from "react";
import useVoiceCommands from "./useVoiceCommands";
import useLanguage from "./useLanguage";

interface Handlers {
  onCommand: (cmd: string) => void;
  onResponse: (reply: string) => void;
}

export default function useConversationalAI({ onCommand, onResponse }: Handlers) {
  const { language } = useLanguage();
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [transcript, setTranscript] = useState("");

  const { setListening: setCommandListening } = useVoiceCommands({
    onNext: () => onCommand("next"),
    onPrev: () => onCommand("prev"),
    onRepeat: () => onCommand("repeat"),
    onStart: () => onCommand("start"),
    onPause: () => onCommand("pause"),
    onResume: () => onCommand("resume"),
    onStop: () => onCommand("stop"),
  });

  async function processQuery(text: string) {
    if (!text) return;
    setThinking(true);
    try {
      const res = await fetch("/api/ai/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language }),
      });
      const data = await res.json();
      if (data.reply) {
        onResponse(data.reply);
        // Speak the AI reply
        const utter = new SpeechSynthesisUtterance(data.reply);
        utter.lang = language === "en" ? "en-US" : language;
        window.speechSynthesis.speak(utter);
      }
    } catch (err) {
      console.error("Conversational AI error:", err);
    } finally {
      setThinking(false);
    }
  }

  return {
    listening,
    setListening,
    thinking,
    transcript,
    processQuery,
  };
}
