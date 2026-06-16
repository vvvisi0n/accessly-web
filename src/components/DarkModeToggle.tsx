"use client";

import { useEffect, useState } from "react";
import DarkModeToggle from "@/components/DarkModeToggle";
<div className="flex justify-end mb-4">
  <DarkModeToggle />
</div>;

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const darkPref = localStorage.getItem("theme") === "dark";
    setIsDark(darkPref);
    document.documentElement.classList.toggle("dark", darkPref);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newDark);
  };

  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded"
    >
      {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
    </button>
  );
}
<div className="bg-white text-black dark:bg-gray-900 dark:text-white">{/* content */}</div>;
