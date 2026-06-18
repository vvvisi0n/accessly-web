import type { MetadataRoute } from "next";
import { createServiceClient } from "@/lib/supabase/server";

export const revalidate = 3600; // Rebuild the sitemap at most once per hour.

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://accessana.com";
  const now = new Date().toISOString();

  // ── Static routes ────────────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/search`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/map`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
  ];

  // ── Dynamic venue pages ──────────────────────────────────────────────────
  // Falls back to static-only if the database schema hasn't been applied yet.
  let venueRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("venues")
      .select("id, updated_at")
      .order("review_count", { ascending: false })
      .limit(10_000);

    if (data?.length) {
      venueRoutes = data.map((v) => ({
        url: `${base}/venue/${v.id}`,
        lastModified: v.updated_at ?? now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch {
    // Database not yet available — sitemap will only contain static routes.
  }

  return [...staticRoutes, ...venueRoutes];
}
