"use client";

import Link from "next/link";
import AccessanaLogo from "./AccessanaLogo";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 shadow bg-white dark:bg-gray-900">
      <div className="flex items-center space-x-3">
        <AccessanaLogo />
        <span className="text-xl font-semibold text-blue-600 dark:text-blue-400">Accessana</span>
      </div>

      <div className="flex space-x-6 text-gray-700 dark:text-gray-200">
        <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
          Home
        </Link>

        <Link href="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">
          Dashboard
        </Link>

        <Link
          href="/dashboard/heatmap"
          className="hover:text-blue-600 dark:hover:text-blue-400 font-medium"
        >
          🗺️ Accessibility Heatmap
        </Link>

        <Link href="/profile" className="hover:text-blue-600 dark:hover:text-blue-400">
          Profile
        </Link>
      </div>
    </nav>
  );
}
