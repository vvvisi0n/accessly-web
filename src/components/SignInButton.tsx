"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function SignInButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <button className="px-4 py-2 bg-gray-200 rounded">Loading...</button>;
  }

  if (status === "authenticated") {
    const user = session.user;

    return (
      <div className="flex items-center gap-3">
        {user?.image && (
          <img src={user.image} alt={user.name || "User"} className="w-8 h-8 rounded-full" />
        )}
        <span className="text-sm text-gray-700">Hi, {user?.name?.split(" ")[0]}</span>
        <button
          onClick={() => signOut()}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Sign In with Google
    </button>
  );
}
