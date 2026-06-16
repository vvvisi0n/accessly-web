import path from "path";
import { fileURLToPath } from "url";
import withBundleAnalyzer from "@next/bundle-analyzer";

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enable bundle analyzer if needed
const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ✅ Correct experimental Turbo config (no more boolean error)
  experimental: {
    turbo: {
      rules: {
        // You can customize build rules later here (e.g., markdown, SVG)
      },
    },
  },

  // ✅ Optional custom webpack adjustments
  webpack: (config) => {
    // Example: simplify imports like "@/components/Example"
    config.resolve.alias["@"] = path.join(__dirname, "src");
    return config;
  },

  // ✅ Optional output settings
  images: {
    domains: ["localhost", "mapbox.com"],
  },

  // ✅ Optional performance tweaks
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default withAnalyzer(nextConfig);
