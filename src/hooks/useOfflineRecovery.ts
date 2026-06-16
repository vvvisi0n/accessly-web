import { useEffect, useState } from "react";

interface OfflineRecoveryOptions<T> {
  key: string;
  data: T | null;
  onRestore?: (data: T) => void;
  onStatusChange?: (online: boolean) => void;
}

export default function useOfflineRecovery<T>({
  key,
  data,
  onRestore,
  onStatusChange,
}: OfflineRecoveryOptions<T>) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  // Watch network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (onStatusChange) onStatusChange(true);
      const cached = localStorage.getItem(key);
      if (cached && onRestore) {
        try {
          const parsed = JSON.parse(cached);
          onRestore(parsed);
          localStorage.removeItem(key);
        } catch {}
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      if (onStatusChange) onStatusChange(false);
      if (data) localStorage.setItem(key, JSON.stringify(data));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [key, data, onRestore, onStatusChange]);

  return { isOnline };
}
