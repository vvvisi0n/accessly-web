"use client";

import { useState } from "react";

export function useSpeech(defaultLang = "en-US") {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [language, setLanguage] = useState(defaultLang);

  const startListening = (onResult: (text: string) => void) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      onResult(transcript);
    };
    recognition.onerror = (e: any) => console.error("Speech error:", e);
    recognition.onend = () => setListening(false);

    setListening(true);
    recognition.start();
  };

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) {
      alert("Speech synthesis not supported in this browser.");
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = language;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  return { listening, speaking, language, setLanguage, startListening, speak };
}
