"use client";

export default function AccessDeniedPage() {
  return (
    <main className="flex flex-col items-center justify-center h-screen text-center space-y-4">
      <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
      <p className="text-neutral-600">
        You don’t have permission to view this page. Please upgrade your account or contact support.
      </p>
      <a href="/" className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
        Return Home
      </a>
    </main>
  );
}
