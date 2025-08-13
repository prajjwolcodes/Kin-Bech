"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useSearchParams } from "next/navigation";
import type { RootState } from "@/lib/store";
import { setCurrentOrder } from "@/lib/features/orders/orderSlice";
import { logout } from "@/lib/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Package, Bell, LogOut, XCircle } from "lucide-react";
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
import { decodeEsewaData } from "@/lib/decodeEsewaData"; // Adjust the import path as necessary

function PaymentSuccessContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pidx = searchParams.get("pidx");
  const rawData = searchParams.get("data") || "";

  const { id: orderId } = useParams();

  const { user, token } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setError("Missing order ID");
      setLoading(false);
      return;
    }
    verifyPayment();
  }, [orderId, rawData, pidx]);

  const verifyPayment = async () => {
    setLoading(true);
    setError("");
    try {
      let body: any = { orderId };

      if (rawData) {
        // Esewa flow
        const decoded = decodeEsewaData(rawData);
        body.status = decoded.status;
        body.transaction_uuid = decoded.transaction_uuid;
        body.amount = decoded.total_amount;
        body.gateway = "ESEWA";
      } else if (pidx) {
        // Khalti flow
        body.pidx = pidx;
        body.gateway = "KHALTI";
      } else {
        throw new Error("No payment data provided");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/checkout/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (response.ok) {
        dispatch(setCurrentOrder(data.order));
        setTimeout(() => {
          router.push(`/buyer/order-confirmation?orderId=${data.order._id}`);
        }, 3000);
      }
    } catch (err) {
      console.error("Payment verification error:", err);
      setError("An error occurred while verifying the payment");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <p>Verifying payment...</p>
      </div>
    );
  }

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <div>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Payment Successful!
                </h1>
                <p className="text-gray-600 mb-6">
                  Your payment has been processed successfully.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Redirecting you to order confirmation...
                </p>
              </div>

              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <RouteGuard allowedRoles={["buyer"]}>
      <PaymentSuccessContent />
    </RouteGuard>
  );
}
