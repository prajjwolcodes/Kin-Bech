"use client";

import type React from "react";

import { useEffect } from "react";
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

  useEffect(() => {
    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo || "/auth/login");
      return;
    }

    // If user is authenticated but shouldn't access this route (like login/signup)
    if (!requireAuth && isAuthenticated) {
      // Redirect to appropriate dashboard based on role
      if (user?.role === "buyer") {
        router.push("/buyer/dashboard");
      } else if (user?.role === "seller") {
        router.push("/seller/dashboard");
      } else if (user?.role === "admin") {
        router.push("/admin/dashboard");
      }
      return;
    }

    // If specific roles are required and user doesn't have the right role
    if (
      requireAuth &&
      isAuthenticated &&
      allowedRoles.length > 0 &&
      user?.role
    ) {
      if (!allowedRoles.includes(user.role)) {
        // Redirect to their appropriate dashboard
        if (user.role === "buyer") {
          router.push("/buyer/dashboard");
        } else if (user.role === "seller") {
          router.push("/seller/dashboard");
        } else if (user.role === "admin") {
          router.push("/admin/dashboard");
        }
        return;
      }
    }
  }, [isAuthenticated, user, router, allowedRoles, requireAuth, redirectTo]);

  // Show loading or nothing while redirecting
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!requireAuth && isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
