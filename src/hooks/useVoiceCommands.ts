"use client";

import { useEffect, useState } from "react";
import useLanguage from "@/hooks/useLanguage"; // Detects user’s preferred language

interface CommandHandler {
  onNext?: () => void;
  onPrev?: () => void;
  onRepeat?: () => void;
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
}

export default function useVoiceCommands(handlers: CommandHandler) {
  const { language } = useLanguage();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  // 🌍 Multilingual keyword mapping
  const COMMANDS: Record<string, keyof CommandHandler> = {
    // English
    next: "onNext",
    previous: "onPrev",
    back: "onPrev",
    repeat: "onRepeat",
    start: "onStart",
    pause: "onPause",
    resume: "onResume",
    stop: "onStop",
    cancel: "onStop",
    // French
    suivant: "onNext",
    précédent: "onPrev",
    retour: "onPrev",
    répète: "onRepeat",
    commencer: "onStart",
    pausez: "onPause",
    reprendre: "onResume",
    arrêter: "onStop",
    // Spanish
    siguiente: "onNext",
    anterior: "onPrev",
    repetir: "onRepeat",
    iniciar: "onStart",
    pausar: "onPause",
    continuar: "onResume",
    detener: "onStop",
    cancelar: "onStop",
    // German
    weiter: "onNext",
    zurück: "onPrev",
    wiederholen: "onRepeat",
    starten: "onStart",
    anhalten: "onPause",
    fortsetzen: "onResume",
    stoppen: "onStop",
    // Swahili
    mbele: "onNext",
    nyuma: "onPrev",
    rudia: "onRepeat",
    anza: "onStart",
    sitisha: "onPause",
    endelea: "onResume",
    simama: "onStop",
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = language || "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const lastResult = event.results[event.results.length - 1];
      if (!lastResult.isFinal) return;
      const text = lastResult[0].transcript.trim().toLowerCase();
      setTranscript(text);
      console.log("🎤 Heard:", text);

      // Find matching command keyword
      for (const key of Object.keys(COMMANDS)) {
        if (text.includes(key)) {
          const action = COMMANDS[key];
          if (action && handlers[action]) {
            console.log(`🎯 Matched "${key}" → ${action}`);
            handlers[action]!();
            break;
          }
        }
      }
    };

    recognition.onerror = (e) => console.error("Voice recognition error:", e);

    if (listening) recognition.start();

    return () => {
      recognition.stop();
    };
  }, [handlers, listening, language]);

  return {
    listening,
    setListening,
    transcript,
  };
}
