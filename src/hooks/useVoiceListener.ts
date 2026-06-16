"use client";

import { useState, useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

export interface VoiceListenerOptions {
  onCommand?: (text: string) => void;
  wakeWord?: string;
  language?: string; // e.g. 'en-US', 'fr-FR', etc.
}

export default function useVoiceListener({
  onCommand,
  wakeWord = "accessly",
  language = "en-US",
}: VoiceListenerOptions) {
  const [active, setActive] = useState(false);
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      console.warn("⚠ Speech recognition not supported in this browser.");
      return;
    }
  }, [browserSupportsSpeechRecognition]);

  // Start continuous listening
  const startListening = () => {
    SpeechRecognition.startListening({ continuous: true, language });
    setActive(true);
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    setActive(false);
  };

  // Detect commands
  useEffect(() => {
    if (!transcript) return;

    const lower = transcript.toLowerCase();

    // Wake word activation
    if (lower.includes(wakeWord.toLowerCase())) {
      const afterWake = lower.split(wakeWord.toLowerCase())[1]?.trim();
      if (afterWake && onCommand) onCommand(afterWake);
      resetTranscript();
    }
  }, [transcript]);

  return {
    listening,
    active,
    startListening,
    stopListening,
    transcript,
  };
}
