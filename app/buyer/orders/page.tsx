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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { logout } from "@/lib/features/auth/authSlice";
import {
  setError,
  setLoading,
  setOrders,
} from "@/lib/features/orders/orderSlice";
import type { RootState } from "@/lib/store";
import { Eye, Filter, Package, Search, TriangleAlert } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// Mock orders data
const mockOrders = [
  {
    _id: "order1",
    buyerId: {
      _id: "buyer1",
      username: "john_doe",
      email: "john@example.com",
    },
    orderItems: [
      {
        productId: {
          _id: "1",
          name: "Wireless Bluetooth Headphones",
          price: 99.99,
          imageUrl: "/placeholder.svg?height=100&width=100&text=Headphones",
        },
        quantity: 1,
        price: 99.99,
      },
    ],
    total: 109.99,
    status: "DELIVERED" as const,
    paymentMethod: "COD" as const,
    shippingInfo: {
      address: "123 Main St",
      city: "Kathmandu",
      postalCode: "44600",
      country: "Nepal",
      phone: "+977-9800000000",
    },
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-18T14:20:00Z",
  },
  {
    _id: "order2",
    buyerId: {
      _id: "buyer1",
      username: "john_doe",
      email: "john@example.com",
    },
    orderItems: [
      {
        productId: {
          _id: "2",
          name: "Smart Fitness Watch",
          price: 199.99,
          imageUrl: "/placeholder.svg?height=100&width=100&text=Watch",
        },
        quantity: 1,
        price: 199.99,
      },
    ],
    total: 219.99,
    status: "PENDING" as const,
    paymentMethod: "ESEWA" as const,
    shippingInfo: {
      address: "123 Main St",
      city: "Kathmandu",
      postalCode: "44600",
      country: "Nepal",
      phone: "+977-9800000000",
    },
    createdAt: "2024-01-20T09:15:00Z",
    updatedAt: "2024-01-20T09:15:00Z",
  },
];

function OrdersPageContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { orders, loading } = useSelector((state: any) => state.orders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    dispatch(setLoading(true));
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/myorders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        dispatch(setOrders(data.data.orders));
      } else {
        throw new Error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      dispatch(
        setError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        )
      );
      // Fallback to mock data
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item: any) =>
        item.productId.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your order history</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filter Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search orders..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-500 mb-6">
                {orders.length === 0
                  ? "You haven't placed any orders yet"
                  : "No orders match your search criteria"}
              </p>
              <Link href="/buyer/dashboard">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order: any) => (
              <Card
                key={order._id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Order #{order._id}
                      </CardTitle>
                      <CardDescription>
                        Placed on{" "}
                        {new Date(order.createdAt).toLocaleDateString()} •
                        Payment: {order.payment?.method}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>

                      {order.status === "PENDING" ? (
                        <Link href={`/buyer/checkout?orderId=${order._id}`}>
                          <Button variant="outline" size="sm">
                            <TriangleAlert className="mr-2 h-4 w-4" />
                            Complete your order
                          </Button>
                        </Link>
                      ) : (
                        <Link
                          href={`/buyer/order-confirmation?orderId=${order._id}`}
                        >
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.items.map((item: any, index: any) => (
                        <div
                          key={index}
                          className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                        >
                          <Image
                            src={item.productId.imageUrl || "/placeholder.svg"}
                            alt={item.productId.name}
                            width={60}
                            height={60}
                            className="rounded object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">
                              {item.productId.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              Rs. {(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          Total: Rs. {order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <RouteGuard allowedRoles={["buyer"]}>
      <OrdersPageContent />
    </RouteGuard>
  );
}
