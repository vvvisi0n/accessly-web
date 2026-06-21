import "./globals.css";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Navbar from "@/components/shared/Navbar";
import OfflineBanner from "@/components/offline/OfflineBanner";
import ServiceWorkerRegistrar from "@/components/offline/ServiceWorkerRegistrar";
import AnaRoot from "@/components/ana/AnaRoot";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "600"],
  style: ["normal", "italic"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#1B6EF3",
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "Accessana",
    template: "%s · Accessana",
  },
  description:
    "Find, review, and rate venues by accessibility. The Access Index tells you how accessible a place really is.",
  metadataBase: new URL(APP_URL),
  openGraph: {
    siteName: "Accessana",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Accessana accessibility reviews",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@accessana",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${plusJakarta.variable}`}>
      <body>
        <ServiceWorkerRegistrar />
        <Navbar />
        {children}
        <OfflineBanner />
        <AnaRoot />
      </body>
    </html>
  );
}
