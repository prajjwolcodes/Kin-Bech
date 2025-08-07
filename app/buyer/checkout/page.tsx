"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "next/navigation";
import type { RootState } from "@/lib/store";
import { setCurrentOrder } from "@/lib/features/orders/orderSlice";
import { logout } from "@/lib/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ShoppingCart,
  CreditCard,
  Truck,
  Shield,
  ArrowLeft,
  Bell,
  LogOut,
  AlertCircle,
  Clock,
} from "lucide-react";
import Image from "next/image";
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

function CheckoutPageContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { currentOrder } = useSelector((state: RootState) => state.orders);
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "COD" | "ESEWA" | "KHALTI"
  >("COD");
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [shippingInfo, setShippingInfo] = useState({
    name: user?.username || "",
    address: "",
    city: "",
    phone: "",
  });

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
    }
  }, [orderId]);

  useEffect(() => {
    if (currentOrder && currentOrder.createdAt) {
      const orderTime = new Date(currentOrder.createdAt).getTime();
      const expiryTime = orderTime + 30 * 60 * 1000; // 30 minutes

      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, expiryTime - now);
        setTimeRemaining(remaining);

        if (remaining === 0) {
          // Order expired, redirect to cart
          router.push("/buyer/cart");
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);

      return () => clearInterval(interval);
    }
  }, [currentOrder, router]);

  const fetchOrderDetails = async (orderIdParam: string) => {
    setOrderLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/single/${orderIdParam}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("Fetched Order Details:", data);
      if (response.ok) {
        dispatch(
          setCurrentOrder({
            ...data.data.order,
            items: data.data.items,
          })
        );

        if (
          data.data.order.status !== "PENDING" ||
          (data.data.order.shippingInfo && data.data.order.paymentMethod)
        ) {
          router.push(
            `/buyer/order-confirmation?orderId=${data.data.order._id}`
          );
        }
      } else {
        setError(data.message || "Failed to fetch order details");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("Failed to load order details");
    } finally {
      setOrderLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleCODPayment = async () => {
    if (
      !shippingInfo.name ||
      !shippingInfo.address ||
      !shippingInfo.city ||
      !shippingInfo.phone
    ) {
      setError("Please fill in all required shipping information");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/checkout/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            shippingInfo,
            paymentMethod: "COD",
            status: "CONFIRMED",
          }),
        }
      );

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        dispatch(
          setCurrentOrder({
            ...data.data.order,
            items: data.data.items, // merge items into order
          })
        );
        router.push(`/buyer/order-confirmation?orderId=${data.data.order._id}`);
      } else {
        setError(data.message || "Failed to update order");
      }
    } catch (error) {
      console.error("Order update error:", error);
      router.push(`/buyer/order-confirmation?orderId=${orderId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDigitalPayment = async (method: "ESEWA" | "KHALTI") => {
    if (
      !shippingInfo.name ||
      !shippingInfo.address ||
      !shippingInfo.city ||
      !shippingInfo.phone
    ) {
      setError("Please fill in all required shipping information");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // First update shipping info and payment method
      const updateResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/checkout/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            shippingInfo,
            paymentMethod,
            SUCCESS_URL: `${window.location.origin}/buyer/payment-success/${orderId}`,
            FAILURE_URL: `${window.location.origin}/buyer/payment-failure/${orderId}`,
          }),
        }
      );

      const updateData = await updateResponse.json();
      console.log(updateData);

      if (updateResponse.ok) {
        dispatch(
          setCurrentOrder({
            ...updateData.data.order,
            items: updateData.data.items,
          })
        );

        if (updateResponse.ok && updateData.url) {
          window.location.href = updateData.url;
        } else {
          setError("Failed to initiate payment");
        }
      } else {
        setError(updateData.message || "Failed to update order");
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (orderLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Order not found
          </h3>
          <p className="text-gray-500 mb-6">
            The order you're looking for doesn't exist or has expired
          </p>
          <Link href="/buyer/cart">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Back to Cart
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/buyer/cart" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                KinBech
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src="/placeholder-user.jpg"
                        alt={user?.username}
                      />
                      <AvatarFallback>
                        {user?.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.username}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Timer Alert */}
        {timeRemaining < 20 && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <Clock className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>
                Time remaining to complete your order:{" "}
                {formatTime(timeRemaining)}
              </strong>
              <br />
              Your order will be automatically cancelled if not completed within
              this time.
            </AlertDescription>
          </Alert>
        )}

        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-6">
          <Link
            href="/buyer/cart"
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="mr-2 h-5 w-5" />
                  Shipping Information
                </CardTitle>
                <CardDescription>Enter your delivery address</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={shippingInfo.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      placeholder="Enter your phone number"
                      value={shippingInfo.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      placeholder="Enter your address"
                      value={shippingInfo.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="Enter your city"
                      value={shippingInfo.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Payment Method
                </CardTitle>
                <CardDescription>
                  Choose your preferred payment method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as any)}
                >
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="COD" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Cash on Delivery</p>
                          <p className="text-sm text-gray-500">
                            Pay when you receive your order
                          </p>
                        </div>
                        <Badge variant="secondary">Recommended</Badge>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="ESEWA" id="esewa" />
                    <Label htmlFor="esewa" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-medium">eSewa</p>
                        <p className="text-sm text-gray-500">
                          Pay securely with eSewa wallet
                        </p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="KHALTI" id="khalti" />
                    <Label htmlFor="khalti" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-medium">Khalti</p>
                        <p className="text-sm text-gray-500">
                          Pay securely with Khalti wallet
                        </p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                <div className="mt-6">
                  {paymentMethod === "COD" ? (
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      onClick={handleCODPayment}
                      disabled={loading}
                    >
                      {loading ? "Confirming Order..." : "Confirm Order"}
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      onClick={() => handleDigitalPayment(paymentMethod)}
                      disabled={loading}
                    >
                      {loading
                        ? "Redirecting..."
                        : `Pay Now with ${paymentMethod}`}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  Order #{currentOrder?._id || "N/A"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {currentOrder?.items && currentOrder.items.length > 0 ? (
                    currentOrder.items.map((item, index) => (
                      <div
                        key={item._id || index}
                        className="flex items-center space-x-3"
                      >
                        <Image
                          src={item.productId?.imageUrl || "/placeholder.svg"}
                          alt={item.productId?.name || "Product"}
                          width={50}
                          height={50}
                          className="rounded object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {item.productId?.name || "Unnamed Product"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No items found in this order.
                    </p>
                  )}
                </div>

                <Separator />

                {/* Pricing */}
                {currentOrder?.total ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{(currentOrder.total / 1.1).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (10%)</span>
                      <span>0.00</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>₹{currentOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Order total not available.
                  </p>
                )}

                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <Shield className="h-4 w-4" />
                  <span>Secure checkout with SSL encryption</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <RouteGuard allowedRoles={["buyer"]}>
      <CheckoutPageContent />
    </RouteGuard>
  );
}
