"use client";

import { useEffect, useState } from "react";

export type Emotion = "neutral" | "happy" | "frustrated" | "calm";

interface EmotionOptions {
  onEmotionChange?: (emotion: Emotion) => void;
}

/**
 * useEmotionDetection — estimates emotion from voice tone & interaction rhythm
 * Uses simple heuristics (pitch, volume, speaking pace) and touch speed.
 */
export default function useEmotionDetection({ onEmotionChange }: EmotionOptions = {}) {
  const [emotion, setEmotion] = useState<Emotion>("neutral");
  const [lastTouchTime, setLastTouchTime] = useState<number>(Date.now());

  // 🎙 Analyze voice via Web Audio API
  useEffect(() => {
    let ctx: AudioContext;
    let analyser: AnalyserNode;
    let dataArray: Uint8Array;

    async function initMic() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        ctx = new AudioContext();
        analyser = ctx.createAnalyser();
        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 2048;
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        const detect = () => {
          analyser.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          const variance =
            dataArray.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / dataArray.length;

          // Simple mood heuristics
          if (avg > 200 && variance > 4000) setEmotion("frustrated");
          else if (avg > 100 && variance < 2000) setEmotion("happy");
          else if (avg < 50) setEmotion("calm");
          else setEmotion("neutral");

          requestAnimationFrame(detect);
        };
        detect();
      } catch (err) {
        console.warn("Voice emotion detection unavailable:", err);
      }
    }

    initMic();
  }, []);

  // 💡 Track fast interactions (taps/clicks = frustration)
  useEffect(() => {
    const handleTouch = () => {
      const now = Date.now();
      if (now - lastTouchTime < 400) setEmotion("frustrated");
      setLastTouchTime(now);
    };
    window.addEventListener("click", handleTouch);
    window.addEventListener("touchstart", handleTouch);
    return () => {
      window.removeEventListener("click", handleTouch);
      window.removeEventListener("touchstart", handleTouch);
    };
  }, [lastTouchTime]);

  // 🧠 Trigger callback on changes
  useEffect(() => {
    onEmotionChange?.(emotion);
  }, [emotion, onEmotionChange]);

  return emotion;
}
