"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "next/navigation";
import type { RootState } from "@/lib/store";
import { logout } from "@/lib/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, Bell, LogOut } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RouteGuard } from "@/components/auth/routeGuard";
import { useRouter } from "next/navigation";

function PaymentFailureContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      if (orderId) {
        router.push(`/buyer/checkout?orderId=${orderId}`);
      } else {
        router.push("/buyer/cart");
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [orderId, router]);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const handleRetry = () => {
    if (orderId) {
      router.push(`/buyer/checkout?orderId=${orderId}`);
    } else {
      router.push("/buyer/cart");
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Failed
              </h1>
              <p className="text-gray-600 mb-6">
                Your payment could not be processed. Please try again or choose
                a different payment method.
              </p>

              <div className="space-y-3">
                <Button
                  onClick={handleRetry}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Try Again
                </Button>
                <Link href="/buyer/cart">
                  <Button variant="outline" className="w-full bg-transparent">
                    Back to Cart
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                Auto-redirecting in 5 seconds...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <RouteGuard allowedRoles={["buyer"]}>
      <PaymentFailureContent />
    </RouteGuard>
  );
}
