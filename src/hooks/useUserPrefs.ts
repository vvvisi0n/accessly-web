"use client";

import { useEffect, useState } from "react";

export type AccessibilityMode = "wheelchair" | "low_vision" | "deaf_hoh" | "none";

const KEY = "accessana_user_prefs_v1";

export function useUserPrefs() {
  const [mode, setMode] = useState<AccessibilityMode>("none");
  const [language, setLanguage] = useState<string>("auto"); // "auto", "en", "es", etc.

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.mode) setMode(parsed.mode);
        if (parsed.language) setLanguage(parsed.language);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ mode, language }));
    } catch {}
  }, [mode, language]);

  return { mode, setMode, language, setLanguage };
}
