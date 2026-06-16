"use client";

import { useEffect, useState } from "react";

export interface UserPrefs {
  theme: string;
  voice: { rate: number; pitch: number; volume: number };
  proximityAlerts: boolean;
  motionEnabled: boolean;
  language: string;
  moodBaseline: string;
}

const DEFAULT_PREFS: UserPrefs = {
  theme: "light",
  voice: { rate: 1, pitch: 1, volume: 1 },
  proximityAlerts: true,
  motionEnabled: false,
  language: "en",
  moodBaseline: "neutral",
};

export default function useUserMemory() {
  const [prefs, setPrefs] = useState<UserPrefs>(DEFAULT_PREFS);

  // Load saved prefs
  useEffect(() => {
    const saved = localStorage.getItem("accessly-user-prefs");
    if (saved) setPrefs(JSON.parse(saved));
  }, []);

  // Save prefs on change
  useEffect(() => {
    localStorage.setItem("accessly-user-prefs", JSON.stringify(prefs));
  }, [prefs]);

  function updatePref<K extends keyof UserPrefs>(key: K, value: UserPrefs[K]) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }

  return { prefs, updatePref };
}
