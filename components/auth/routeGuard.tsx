"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: ("buyer" | "seller" | "admin")[];
  requireAuth?: boolean;
  redirectTo?: string;
}

export function RouteGuard({
  children,
  allowedRoles = [],
  requireAuth = true,
  redirectTo,
}: RouteGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Only run redirects after mount to avoid SSR mismatch
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo || "/auth/login");
      return;
    }

    if (!requireAuth && isAuthenticated) {
      if (user?.role === "buyer") {
        router.push("/buyer/dashboard");
      } else if (user?.role === "seller") {
        router.push("/seller/dashboard");
      } else if (user?.role === "admin") {
        router.push("/admin/dashboard");
      }
      return;
    }

    if (
      requireAuth &&
      isAuthenticated &&
      allowedRoles.length > 0 &&
      user?.role &&
      !allowedRoles.includes(user.role)
    ) {
      if (user.role === "buyer") {
        router.push("/buyer/dashboard");
      } else if (user.role === "seller") {
        router.push("/seller/dashboard");
      } else if (user.role === "admin") {
        router.push("/admin/dashboard");
      }
    }
  }, [isAuthenticated, user, router, allowedRoles, requireAuth, redirectTo]);

  // ✅ During SSR and hydration, render a stable placeholder
  if (!mounted) {
    return <div className="min-h-[calc(100vh-5rem)] bg-gray-50" />;
  }

  // Show loading or redirecting indicators after mount
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!requireAuth && isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (
    requireAuth &&
    isAuthenticated &&
    allowedRoles.length > 0 &&
    user?.role &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
