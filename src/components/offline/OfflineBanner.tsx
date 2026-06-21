"use client";

import { useOfflineStatus } from "@/hooks/useOfflineQueue";

export default function OfflineBanner() {
  const { isOnline, pendingCount } = useOfflineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: 72, // above bottom nav / sticky review CTA
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 60,
        background: "#1c1c1e",
        color: "#f9fafb",
        borderRadius: 24,
        padding: "10px 18px",
        fontSize: "0.82rem",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: 8,
        boxShadow: "0 4px 24px rgba(0,0,0,0.28)",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#9ca3af",
          flexShrink: 0,
        }}
      />
      {pendingCount > 0
        ? `Offline. ${pendingCount} submission${pendingCount !== 1 ? "s" : ""} will sync when you reconnect.`
        : "You're offline. Submissions will sync when you reconnect."}
    </div>
  );
}
