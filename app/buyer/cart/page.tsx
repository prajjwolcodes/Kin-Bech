"use client";

import { RouteGuard } from "@/components/auth/routeGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { logout } from "@/lib/features/auth/authSlice";
import {
  clearCart,
  removeFromCart,
  updateQuantity,
} from "@/lib/features/cart/cartSlice";
import type { RootState } from "@/lib/store";
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function CartPageContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { items, total, itemCount } = useSelector(
    (state: RootState) => state.cart
  );
  const [loading, setLoading] = useState(false);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      dispatch(updateQuantity({ _id: itemId, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (itemId: string) => {
    dispatch(removeFromCart(itemId));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const handleProceedToOrder = async () => {
    if (items.length === 0) return;

    // Check if user is authenticated
    if (!user || !token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to proceed with your order.",
        variant: "destructive",
      });
      router.push("/auth/login");
      return;
    }

    // Validate cart items before proceeding
    const invalidItems = items.filter(
      (item) =>
        !item._id ||
        !item.quantity ||
        item.quantity <= 0 ||
        !item.sellerId ||
        item.quantity > item.count
    );

    if (invalidItems.length > 0) {
      toast({
        title: "Invalid Cart Items",
        description:
          "Some items in your cart are invalid. Please refresh the page and try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
        })),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "success") {
        // Only clear cart after successful order creation
        dispatch(clearCart());
        toast({
          title: "Order Created Successfully",
          description: "Redirecting to checkout...",
        });
        router.push(`/buyer/checkout?orderId=${data.data.order._id}`);
      } else {
        // Handle specific error cases
        const errorMessage = data.message || "Failed to create order";

        if (response.status === 403) {
          toast({
            title: "Access Denied",
            description: "Please make sure you're logged in as a buyer.",
            variant: "destructive",
          });
        } else if (response.status === 400) {
          toast({
            title: "Order Creation Failed",
            description: errorMessage,
            variant: "destructive",
          });
        } else if (errorMessage.includes("Insufficient stock")) {
          toast({
            title: "Insufficient Stock",
            description:
              "Some items in your cart are out of stock. Please update quantities and try again.",
            variant: "destructive",
          });
          // Don't clear cart so user can adjust quantities
        } else if (errorMessage.includes("not found")) {
          toast({
            title: "Products Unavailable",
            description:
              "Some products in your cart are no longer available. Please remove them and try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Order Failed",
            description: errorMessage,
            variant: "destructive",
          });
        }

        console.error("Failed to create order:", data);
      }
    } catch (error) {
      console.error("Order creation error:", error);
      toast({
        title: "Network Error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-6">
          <Link
            href="/buyer/dashboard"
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex text-xl items-center">
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Shopping Cart ({itemCount} items)
                    </CardTitle>
                  </div>
                  {items.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearCart}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear Cart
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Your cart is empty
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Start shopping to add items to your cart
                    </p>
                    <Link href="/buyer/dashboard">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        Start Shopping
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center space-x-4 p-4 border rounded-lg"
                      >
                        <Image
                          src={item.imageUrl || "/placeholder.svg"}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-gray-500">
                            by {item.sellerName}
                          </p>
                          <p className="text-lg font-bold text-blue-600">
                            Rs. {item.price}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleQuantityChange(item._id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                item._id,
                                Number.parseInt(e.target.value) || 1
                              )
                            }
                            className="w-16 text-center"
                            min="1"
                            max={item.count}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleQuantityChange(item._id, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.count}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">
                            Rs. {(item.price * item.quantity).toFixed(2)}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax </span>
                  <span>0.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Total ({itemCount} items)</span>
                  <span>Rs. {total.toFixed(2)}</span>
                </div>
                <Separator />
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                  onClick={handleProceedToOrder}
                  disabled={items.length === 0 || loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Order...
                    </div>
                  ) : (
                    "Proceed to Order"
                  )}
                </Button>
                <div className="text-center">
                  <Badge variant="secondary" className="text-xs">
                    COD, Esewa and Khalti payment available
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <RouteGuard allowedRoles={["buyer"]}>
      <CartPageContent />
    </RouteGuard>
  );
}
