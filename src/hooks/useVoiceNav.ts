"use client";

import { useCallback, useEffect, useState } from "react";
import { bearing, cardinalFromBearing, haversine, metersToHuman, LatLng } from "@/utils/geo";

export type NavPlace = {
  id: string;
  name: string;
  address?: string;
  location: LatLng;
};

export type NavStep = {
  fromName: string;
  toName: string;
  distanceM: number;
  bearingDeg: number;
  summary: string;
};

type VoiceCfg = { lang: string; rate: number; pitch: number };

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN; // keep inactive until you add it later

export default function useVoiceNav(places: NavPlace[], cfg?: Partial<VoiceCfg>) {
  const [steps, setSteps] = useState<NavStep[]>([]);
  const [index, setIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [proximity, setProximity] = useState<number | null>(null);
  const [offCourse, setOffCourse] = useState(false);

  const voiceCfg: VoiceCfg = {
    lang: cfg?.lang || "en-US",
    rate: cfg?.rate ?? 1,
    pitch: cfg?.pitch ?? 1,
  };

  // Build fallback route
  useEffect(() => {
    if (!places || places.length < 2) {
      setSteps([]);
      setIndex(0);
      return;
    }
    const s: NavStep[] = [];
    for (let i = 0; i < places.length - 1; i++) {
      const a = places[i];
      const b = places[i + 1];
      const dist = haversine(a.location, b.location);
      const brg = bearing(a.location, b.location);
      const card = cardinalFromBearing(brg);
      const sum = `From ${a.name}, head ${card} towards ${b.name}. Distance ${metersToHuman(
        dist
      )}.`;
      s.push({
        fromName: a.name,
        toName: b.name,
        distanceM: dist,
        bearingDeg: brg,
        summary: sum,
      });
    }
    setSteps(s);
    setIndex(0);
  }, [places]);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = voiceCfg.lang;
      u.rate = voiceCfg.rate;
      u.pitch = voiceCfg.pitch;
      u.onstart = () => setIsSpeaking(true);
      u.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };
      window.speechSynthesis.speak(u);
    },
    [voiceCfg.lang, voiceCfg.rate, voiceCfg.pitch]
  );

  const start = useCallback(() => {
    if (steps.length === 0) return;
    speak(`Starting navigation. ${steps[0].summary}`);
  }, [steps, speak]);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    if (window.speechSynthesis?.speaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (window.speechSynthesis?.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, []);

  const speakCurrent = useCallback(() => {
    if (steps[index]) speak(steps[index].summary);
  }, [steps, index, speak]);

  const next = useCallback(() => {
    if (index < steps.length - 1) {
      const newIx = index + 1;
      setIndex(newIx);
      speak(steps[newIx].summary);
    } else {
      speak("You have reached your final destination.");
    }
  }, [index, steps, speak]);

  const prev = useCallback(() => {
    if (index > 0) {
      const newIx = index - 1;
      setIndex(newIx);
      speak(steps[newIx].summary);
    } else {
      speak("You are at the first segment.");
    }
  }, [index, steps, speak]);

  // --- 🛰 Auto-advance + off-course detection ---
  useEffect(() => {
    if (!autoAdvance || steps.length === 0) return;
    let watchId: number | null = null;

    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const current = { lat: latitude, lng: longitude };
          const nextStop = places[index + 1];
          if (!nextStop) return;
          const dist = haversine(current, nextStop.location);
          setProximity(dist);

          // --- reached next stop ---
          if (dist < 30) {
            speak(`Arrived at ${nextStop.name}.`);
            setTimeout(() => {
              if (index < steps.length - 1) {
                setIndex((i) => i + 1);
                speak(steps[index + 1].summary);
              } else {
                speak("Navigation complete.");
                stop();
              }
            }, 1000);
            setOffCourse(false);
            return;
          }

          // --- detect deviation ---
          const currentTarget = places[index + 1];
          const expectedDistance = steps[index]?.distanceM || 0;
          const deviation = Math.abs(expectedDistance - dist);
          if (deviation > 50 && !offCourse) {
            setOffCourse(true);
            speak("You appear to be off route. Recalculating...");
            if (MAPBOX_TOKEN) {
              try {
                const coords = `${current.lng},${current.lat};${currentTarget.location.lng},${currentTarget.location.lat}`;
                const resp = await fetch(
                  `https://api.mapbox.com/directions/v5/mapbox/walking/${coords}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
                );
                const data = await resp.json();
                if (data.routes?.length) {
                  const newDist = data.routes[0].distance;
                  const newTime = Math.round(data.routes[0].duration / 60);
                  speak(
                    `New route calculated. Distance ${metersToHuman(
                      newDist
                    )}, approximately ${newTime} minutes to ${currentTarget.name}.`
                  );
                }
              } catch (err) {
                console.error("Recalc failed:", err);
              }
            } else {
              // fallback offline recalculation
              speak(
                `You are off route by ${metersToHuman(
                  deviation
                )}. Please head toward ${currentTarget.name}.`
              );
            }
            setTimeout(() => setOffCourse(false), 15000); // avoid spamming recalculation
          }
        },
        (err) => console.warn("Geo error:", err),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
      );
    }

    return () => {
      if (watchId && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [autoAdvance, index, steps, places, speak, stop, offCourse]);

  return {
    steps,
    index,
    isSpeaking,
    isPaused,
    start,
    stop,
    pause,
    resume,
    next,
    prev,
    speakCurrent,
    setIndex,
    autoAdvance,
    setAutoAdvance,
    proximity,
    offCourse,
  };
}
