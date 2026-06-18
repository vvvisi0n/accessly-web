import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Civic accessibility map",
  description:
    "See and report broken sidewalks, missing curb cuts, blocked ramps, broken elevators, and other infrastructure barriers. Reports are routed directly to city 311 systems.",
  openGraph: {
    title: "Civic accessibility map · Accessana",
    description:
      "Live map of infrastructure accessibility issues. Report and upvote barriers in your city.",
    type: "website",
  },
};

export default function CivicMapLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
