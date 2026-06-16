// src/app/page.tsx
"use client";

import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";
import SignInButton from "@/components/SignInButton";
import MyReviews from "@/components/MyReviews";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="max-w-4xl mx-auto p-4">
      <Head>
        <title>Accessly – Real Accessibility Reviews</title>
        <meta
          name="description"
          content="Accessly helps you find and share real accessibility information about places near you. Join the community."
        />
        <meta property="og:title" content="Accessly – Real Accessibility Reviews" />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:description" content="Find and share accessibility experiences." />
        <meta property="og:url" content="https://accessly.io" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Accessly: Share Accessibility Reviews</h1>
        <div className="flex gap-4 items-center">
          <a href="/bookmarks" className="text-blue-600 hover:underline text-sm">
            🔖 Saved
          </a>
          <SignInButton />
        </div>
      </div>

      {/* Hero Image */}
      <div className="rounded-lg overflow-hidden shadow mb-8">
        <Image
          src="/cover-accessibility.jpg"
          alt="Accessibility Community"
          width={1000}
          height={400}
          className="w-full object-cover"
        />
      </div>

      {/* Review Form for Logged-in Users */}
      {session && (
        <>
          <ReviewForm />
          <MyReviews />
        </>
      )}

      <hr className="my-8" />
      <ReviewList />
    </main>
  );
}
