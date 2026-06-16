"use client";

import { useEffect, useState } from "react";

interface EnvState {
  brightness: "bright" | "dim";
  noiseLevel: number; // decibels
  weather?: string;
  temperature?: number;
}

export default function useEnvironmentAwareness() {
  const [env, setEnv] = useState<EnvState>({
    brightness: "bright",
    noiseLevel: 0,
  });

  // 🌓 Detect ambient light (if supported)
  useEffect(() => {
    if ("AmbientLightSensor" in window) {
      // @ts-ignore
      const sensor = new AmbientLightSensor();
      sensor.addEventListener("reading", () => {
        setEnv((e) => ({
          ...e,
          brightness: sensor.illuminance < 20 ? "dim" : "bright",
        }));
      });
      sensor.start();
    }
  }, []);

  // 🎙 Measure noise via microphone
  useEffect(() => {
    async function startNoiseMonitor() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const ctx = new AudioContext();
        const analyser = ctx.createAnalyser();
        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);

        const measure = () => {
          analyser.getByteFrequencyData(data);
          const avg = data.reduce((a, b) => a + b, 0) / data.length;
          setEnv((e) => ({ ...e, noiseLevel: Math.round(avg) }));
          requestAnimationFrame(measure);
        };
        measure();
      } catch (err) {
        console.warn("Noise monitor unavailable:", err);
      }
    }
    startNoiseMonitor();
  }, []);

  // 🌦 Fetch weather from Open-Meteo (free, no key needed)
  useEffect(() => {
    async function fetchWeather() {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        );
        const json = await res.json();
        setEnv((e) => ({
          ...e,
          weather: json.current_weather.weathercode?.toString() ?? "unknown",
          temperature: json.current_weather.temperature,
        }));
      });
    }
    fetchWeather();
  }, []);

  return env;
}
