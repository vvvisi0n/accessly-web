"use client";

import { useState, useEffect } from "react";

export type MapTheme = "light" | "dark" | "high-contrast";

export default function useMapTheme() {
  const [theme, setTheme] = useState<MapTheme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("map-theme");
    if (stored) setTheme(stored as MapTheme);
  }, []);

  function changeTheme(next: MapTheme) {
    setTheme(next);
    localStorage.setItem("map-theme", next);
  }

  return { theme, setTheme: changeTheme };
}
