import "./globals.css";
import { Inter } from "next/font/google";
import { Metadata, Viewport } from "next";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import { ReactNode } from "react";
import AIChatWidget from "@/components/chat/AIChatWidget";

const inter = Inter({ subsets: ["latin"] });

// ✅ Viewport settings (handles theme color)
export const viewport: Viewport = {
  themeColor: "#4361EE",
};

// ✅ App metadata
export const metadata: Metadata = {
  title: "Accessly",
  description: "Find and share accessible places in your city.",
  manifest: "/manifest.json",
  icons: {
    icon: "/assets/logo/favicon.ico",
    apple: "/assets/logo/logo-light.png",
  },
};

// ✅ Root layout
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Global Session Provider */}
        <SessionProviderWrapper>
          {children}
          {/* 🌟 Accessly AI Chat Widget — visible on every page */}
          <AIChatWidget />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
