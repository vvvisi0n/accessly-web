import type { Metadata } from "next";
import type { ReactNode } from "react";

// Review flow is auth-gated - exclude from indexing.
export const metadata: Metadata = {
  title: "Write an accessibility review",
  description:
    "Rate a venue's entrance, bathrooms, parking, staff, and sensory environment to help others know what to expect.",
  robots: { index: false, follow: false },
};

export default function ReviewLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
