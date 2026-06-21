"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useOfflineWakeWord from "@/hooks/useOfflineWakeWord";

export type AnaState = "dormant" | "listening" | "thinking" | "responding" | "image-reading";

export interface AnaMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AnaHook {
  state: AnaState;
  messages: AnaMessage[];
  transcript: string; // live speech preview while listening
  statusText: string; // "Checking the Access Index..." during thinking
  conversationId: string | null;
  isSpeaking: boolean;
  // Actions
  activate: () => void;
  dismiss: () => void;
  sendText: (text: string) => void;
  openImageReader: (task: "menu" | "sign" | "mail" | "describe_room" | "hazard_check" | "find_item") => void;
  submitImage: (base64: string, mediaType: "image/jpeg" | "image/png" | "image/webp", task: string) => void;
  resetConversation: () => void;
}

const STATUS_STEPS = [
  "Thinking...",
  "Checking the Access Index...",
  "Searching nearby venues...",
  "Finding what you need...",
];

export function useAna(): AnaHook {
  const [state, setState] = useState<AnaState>("dormant");
  const [messages, setMessages] = useState<AnaMessage[]>([]);
  const [transcript, setTranscript] = useState("");
  const [statusText, setStatusText] = useState(STATUS_STEPS[0]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const statusTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationRef = useRef<{ lat: number; lng: number } | null>(null);
  const imageTaskRef = useRef<string>("menu");

  // Get user location in background
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        locationRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      },
      () => {},
      { timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Wake word activation (uses mock mode during dev; Porcupine key needed for prod)
  const handleWake = useCallback(() => {
    if (state === "dormant") activate();
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  useOfflineWakeWord({ onWake: handleWake });

  // Rotate thinking status text during API call
  function startStatusRotation() {
    let idx = 0;
    statusTimerRef.current = setInterval(() => {
      idx = (idx + 1) % STATUS_STEPS.length;
      setStatusText(STATUS_STEPS[idx]);
    }, 2200);
  }

  function stopStatusRotation() {
    if (statusTimerRef.current) {
      clearInterval(statusTimerRef.current);
      statusTimerRef.current = null;
    }
    setStatusText(STATUS_STEPS[0]);
  }

  // Start listening via Web Speech API
  function startListening() {
    if (typeof window === "undefined") return;
    const SR = window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (e: SpeechRecognitionEvent) => {
      const interim = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(" ");
      setTranscript(interim);

      const final = Array.from(e.results)
        .filter((r) => r.isFinal)
        .map((r) => r[0].transcript)
        .join(" ")
        .trim();
      if (final) sendText(final);
    };

    rec.onerror = () => dismiss();
    rec.onend = () => {
      // If still listening when recognition ends (no speech), dismiss
      setState((s) => {
        if (s === "listening") {
          setTranscript("");
          return "dormant";
        }
        return s;
      });
    };

    rec.start();
    recognitionRef.current = rec;
  }

  function stopListening() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setTranscript("");
  }

  // Speak Ana's response aloud
  function speak(text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  // Send message to Ana API
  async function sendToApi(
    message: string,
    opts?: { imageBase64?: string; imageMediaType?: string; imageTask?: string }
  ) {
    setState("thinking");
    startStatusRotation();

    try {
      const res = await fetch("/api/ana", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          conversationId,
          lat: locationRef.current?.lat,
          lng: locationRef.current?.lng,
          ...opts,
        }),
      });

      const data = (await res.json()) as {
        response?: string;
        conversationId?: string;
        error?: string;
      };

      stopStatusRotation();

      if (data.error || !data.response) {
        const errText = data.error ?? "Something went wrong. Try again.";
        setMessages((m) => [...m, { role: "assistant", content: errText }]);
        setState("responding");
        return;
      }

      if (data.conversationId) setConversationId(data.conversationId);

      setMessages((m) => [...m, { role: "assistant", content: data.response! }]);
      setState("responding");
      speak(data.response!);
    } catch {
      stopStatusRotation();
      const errText = "I couldn't reach the server. Check your connection.";
      setMessages((m) => [...m, { role: "assistant", content: errText }]);
      setState("responding");
    }
  }

  // ── Public actions ────────────────────────────────────────

  const activate = useCallback(() => {
    setState("listening");
    setTranscript("");
    startListening();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dismiss = useCallback(() => {
    stopListening();
    stopStatusRotation();
    window.speechSynthesis?.cancel();
    setState("dormant");
    setTranscript("");
    setIsSpeaking(false);
  }, []);

  const sendText = useCallback((text: string) => {
    stopListening();
    setMessages((m) => [...m, { role: "user", content: text }]);
    sendToApi(text);
  }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  const openImageReader = useCallback(
    (task: "menu" | "sign" | "mail" | "describe_room" | "hazard_check" | "find_item") => {
      imageTaskRef.current = task;
      setState("image-reading");
    },
    []
  );

  const submitImage = useCallback(
    (base64: string, mediaType: "image/jpeg" | "image/png" | "image/webp", task: string) => {
      const label = task.replace(/_/g, " ");
      setMessages((m) => [...m, { role: "user", content: `[Photo for ${label}]` }]);
      sendToApi(`Please ${label} this image.`, {
        imageBase64: base64,
        imageMediaType: mediaType,
        imageTask: task,
      });
    },
    [conversationId] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const resetConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
  }, []);

  return {
    state,
    messages,
    transcript,
    statusText,
    conversationId,
    isSpeaking,
    activate,
    dismiss,
    sendText,
    openImageReader,
    submitImage,
    resetConversation,
  };
}
