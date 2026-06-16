"use client";

import { useSession, signOut } from "next-auth/react";

export default function UserHeader() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p className="text-gray-500">Loading user info...</p>;
  }

  if (!session?.user) return null;

  return (
    <div className="flex items-center justify-between bg-gray-100 p-4 mb-4 rounded">
      <div className="flex items-center gap-4">
        {session.user.image && (
          <img src={session.user.image} alt="User Avatar" className="w-10 h-10 rounded-full" />
        )}
        <p className="text-sm">Welcome back, {session.user.name}!</p>
      </div>
      <button
        onClick={() => signOut()}
        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
      >
        Sign out
      </button>
    </div>
  );
}
