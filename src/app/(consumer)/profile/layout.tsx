import type { Metadata } from "next";
import type { ReactNode } from "react";

// Profile is auth-gated — exclude from indexing.
export const metadata: Metadata = {
  title: "My accessibility profile",
  description:
    "Set your accessibility needs so Accessana can surface the most relevant venues for you.",
  robots: { index: false, follow: false },
};

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
