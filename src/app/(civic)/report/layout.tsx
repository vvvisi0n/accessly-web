import type { Metadata } from "next";
import type { ReactNode } from "react";

// Form page - exclude from indexing to avoid duplicate soft-404 signals.
export const metadata: Metadata = {
  title: "Report an accessibility issue",
  description:
    "Report broken sidewalks, missing curb cuts, blocked ramps, and other infrastructure barriers. We route reports directly to your city's 311 system.",
  robots: { index: false, follow: false },
};

export default function ReportLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
