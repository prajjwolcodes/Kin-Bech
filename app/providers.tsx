"use client";

import type React from "react";
import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "@/lib/store";
import { setCredentials } from "@/lib/features/auth/authSlice";
import { Toaster } from "@/components/ui/toaster";

function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check for stored authentication on app load
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch(setCredentials({ user, token }));
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, [dispatch]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </Provider>
  );
}
