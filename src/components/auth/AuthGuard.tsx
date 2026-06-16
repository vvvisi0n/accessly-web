"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { accessRules, UserRole } from "@/config/access";

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export default function AuthGuard({ children, redirectTo = "/login" }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Extract user role from session (defaults to "free")
  const role = (session?.user?.role as UserRole) || "free";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(redirectTo);
    } else if (status === "authenticated") {
      const allowedRoles = accessRules[pathname] || ["free"];
      if (!allowedRoles.includes(role)) {
        router.push("/access-denied");
      }
    }
  }, [status, pathname, role, router, redirectTo]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-neutral-600 text-sm">Verifying your access...</p>
      </div>
    );
  }

  if (status === "authenticated") {
    return <>{children}</>;
  }

  return null;
}
