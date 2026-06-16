"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex items-center gap-4">
      {session ? (
        <>
          {session.user?.image && (
            <Image
              src={session.user.image}
              alt={session.user.name || "User"}
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <span className="font-medium">{session.user?.name}</span>
          <button
            onClick={() => signOut()}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Sign out
          </button>
        </>
      ) : (
        <button
          onClick={() => signIn("google")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}
