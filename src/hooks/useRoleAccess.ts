"use client";
import { useSession } from "next-auth/react";
import { features } from "@/config/features";

export function useRoleAccess() {
  const { data: session } = useSession();
  const role = session?.user?.role || "free";

  const hasFeature = (feature: string) => {
    const allowed = Object.entries(features).flatMap(([roleKey, list]) =>
      roleKey === role ? list : []
    );
    return allowed.includes(feature);
  };

  return { role, hasFeature };
}
