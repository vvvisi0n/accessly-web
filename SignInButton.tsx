// src/components/SignInButton.tsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function SignInButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <button className="px-4 py-2 bg-gray-200 rounded">Loading...</button>;
  }

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Sign out
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      Sign in with Google
    </button>
  );
}
