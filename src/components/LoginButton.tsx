// src/components/LoginButton.tsx
"use client";

import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

export default function LoginButton() {
  const [user, loading, error] = useAuthState(auth);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Sign-in error:", err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign-out error:", err);
    }
  };

  if (loading) return <p>Loading auth...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="mb-4">
      {user ? (
        <div className="flex items-center justify-between">
          <p className="text-sm">Signed in as: {user.displayName}</p>
          <button
            onClick={handleSignOut}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={handleSignIn}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}
