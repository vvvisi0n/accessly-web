import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://accessana.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/search", "/venue/", "/map"],
        // Auth-gated, form, and API routes should not be indexed.
        disallow: ["/profile", "/review/", "/report", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
