"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface SpeechResult {
  transcript: string;
  isFinal: boolean;
}

export default function useSpeechToText({
  lang = "en-US",
  continuous = false,
  interimResults = true,
  onResult,
  onEnd,
}: {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (res: SpeechResult) => void;
  onEnd?: () => void;
} = {}) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [transcript, setTranscript] = useState("");

  // Initialize SpeechRecognition
  useEffect(() => {
    // @ts-expect-error – webkit prefix still required in many browsers
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported in this browser.");
      setSupported(false);
      return;
    }

    const recognition: SpeechRecognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) finalTranscript += result[0].transcript;
        else interimTranscript += result[0].transcript;
      }
      const full = finalTranscript || interimTranscript;
      setTranscript(full);
      onResult?.({
        transcript: full.trim(),
        isFinal: !!finalTranscript,
      });
    };

    recognition.onend = () => {
      setListening(false);
      onEnd?.();
    };

    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, [lang, continuous, interimResults, onResult, onEnd]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch (err) {
      console.error("Speech start error:", err);
    }
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const toggle = () => {
    if (listening) stopListening();
    else startListening();
  };

  return {
    supported,
    listening,
    transcript,
    startListening,
    stopListening,
    toggle,
    setTranscript,
  };
}
