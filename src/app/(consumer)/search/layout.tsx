import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Search accessible venues",
  description:
    "Find restaurants, hotels, transit stops, parks, and more — filtered by disability type and rated by the Accessana Access Index.",
  openGraph: {
    title: "Search accessible venues · Accessana",
    description:
      "Find places rated for mobility, vision, hearing, cognitive, and sensory accessibility.",
    type: "website",
  },
};

export default function SearchLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
