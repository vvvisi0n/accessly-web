"use client";

import { useEffect, useRef, useState } from "react";
import useVoiceMemory from "./useVoiceMemory";

type VoiceContext =
  | "normal"
  | "alert"
  | "approaching"
  | "calm"
  | "motivational"
  | "friendly"
  | "professional";

export default function useVoice() {
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const { profile, updateVoiceProfile } = useVoiceMemory();

  // 🧠 Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;

      const loadVoices = () => {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
      };

      // Voices may load asynchronously
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    } else {
      console.warn("⚠️ Speech synthesis not supported in this browser.");
    }
  }, []);

  // 🎭 Match system voice to tone context
  function getVoiceForContext(context?: VoiceContext): SpeechSynthesisVoice | null {
    if (!voices.length) return null;

    const find = (keyword: string) =>
      voices.find((v) => v.name.toLowerCase().includes(keyword.toLowerCase()));

    switch (context) {
      case "professional":
        return find("Daniel") || find("Google UK English Male") || voices[0];
      case "friendly":
        return find("Samantha") || find("Google US English Female") || voices[0];
      case "motivational":
        return find("Google US English Male") || find("Daniel") || voices[0];
      case "calm":
        return find("Google UK English Female") || find("Karen") || voices[0];
      case "alert":
        return find("Google US English Male") || voices[0];
      default:
        return find("Google US English Female") || voices[0];
    }
  }

  // 🗣 Speak with adaptive tone and memory
  function speak(text: string, lang: string = "en-US", options?: { context?: VoiceContext }) {
    if (!synthRef.current) return;

    // Cancel current speech before speaking new
    synthRef.current.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;

    // 🧠 Apply remembered tone or fallback to new context
    const context = options?.context ?? profile?.tone ?? "normal";

    // 🎭 Select voice based on context or memory
    const persona =
      voices.find((v) => v.name === profile?.voiceName) || getVoiceForContext(context);
    if (persona) {
      utter.voice = persona;
      updateVoiceProfile({ voiceName: persona.name });
    }

    // 🎚 Apply remembered rate & pitch
    utter.rate = profile?.rate ?? 1;
    utter.pitch = profile?.pitch ?? 1;

    // ⚙️ Adjust dynamically based on mood context
    switch (context) {
      case "alert":
        utter.rate = 1.2;
        utter.pitch = 1.3;
        utter.volume = 1;
        break;
      case "approaching":
        utter.rate = 1.15;
        utter.pitch = 1.1;
        break;
      case "calm":
        utter.rate = 0.85;
        utter.pitch = 0.9;
        utter.volume = 0.9;
        break;
      case "motivational":
        utter.rate = 1.3;
        utter.pitch = 1.1;
        utter.volume = 1;
        break;
      case "friendly":
        utter.rate = 1.1;
        utter.pitch = 1.2;
        utter.volume = 1;
        break;
      case "professional":
        utter.rate = 1.0;
        utter.pitch = 1.0;
        utter.volume = 1;
        break;
      default:
        utter.rate = 1;
        utter.pitch = 1;
    }

    synthRef.current.speak(utter);
  }

  return { speak, voices, profile, updateVoiceProfile };
}
