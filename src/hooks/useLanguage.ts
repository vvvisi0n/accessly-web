"use client";

import { useEffect, useState } from "react";

/**
 * useLanguage Hook
 * ----------------
 * Detects the user's preferred language automatically from their browser.
 * Returns a two-letter ISO code (e.g., "en", "fr", "es", "de").
 *
 * Example usage:
 *   const language = useLanguage();
 *   console.log(language); // "fr"
 */

export default function useLanguage() {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    // 1️⃣ Detect browser language (e.g., "en-US" → "en")
    const browserLang = typeof navigator !== "undefined" ? navigator.language : "en";

    // 2️⃣ Extract the ISO-639-1 code (first two letters)
    const shortLang = browserLang.slice(0, 2);

    // 3️⃣ Set the detected language
    setLanguage(shortLang || "en");
  }, []);

  return language;
}
