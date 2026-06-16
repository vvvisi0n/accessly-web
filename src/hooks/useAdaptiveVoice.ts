"use client";

import { useState, useEffect, useCallback } from "react";

interface SpeakOptions {
  text: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceName?: string;
  context?: "normal" | "alert" | "approaching" | "offcourse" | "calm" | "response";
  language?: string;
}

export default function useAdaptiveVoice({
  defaultRate = 1,
  defaultPitch = 1,
  language = "en-US",
}: {
  defaultRate?: number;
  defaultPitch?: number;
  language?: string;
} = {}) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      if (!currentVoice) {
        const enVoice = v.find((voice) => voice.lang.startsWith(language)) || v[0];
        setCurrentVoice(enVoice || null);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [language, currentVoice]);

  // Main speak function
  const speak = useCallback(
    (opts: SpeakOptions) => {
      if (!opts.text) return;
      const utterance = new SpeechSynthesisUtterance(opts.text);

      utterance.lang = opts.language || language;
      utterance.rate = opts.rate ?? defaultRate;
      utterance.pitch = opts.pitch ?? defaultPitch;
      utterance.volume = opts.volume ?? 1;
      utterance.voice =
        voices.find((v) => v.name === opts.voiceName) || currentVoice || voices[0];

      // 🔊 Contextual tone adjustments
      switch (opts.context) {
        case "alert":
          utterance.rate = 1.2;
          utterance.pitch = 1.3;
          break;
        case "approaching":
          utterance.rate = 1.1;
          utterance.pitch = 1.1;
          break;
        case "offcourse":
          utterance.rate = 1.3;
          utterance.pitch = 0.9;
          break;
        case "calm":
          utterance.rate = 0.9;
          utterance.pitch = 0.8;
          break;
        case "response":
          utterance.rate = 1;
          utterance.pitch = 1;
          break;
        default:
          break;
      }

      // Cancel any current speech before starting
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    },
    [voices, currentVoice, language, defaultRate, defaultPitch]
  );

  return { voices, currentVoice, speak, setCurrentVoice };
}
