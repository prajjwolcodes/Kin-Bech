"use client";

import { RouteGuard } from "@/components/auth/routeGuard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { setError, setLoading } from "@/lib/features/products/productSlice";
import type { RootState } from "@/lib/store";
import {
  AlertCircle,
  DollarSign,
  Eye,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SellerStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  monthlyGrowth: number;
  pendingOrders: number;
  lowStockProducts: number;
  completedOrders: number;
}

interface OrderItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    imageUrl?: string;
  };
  quantity: number;
  price: number;
  sellerId: {
    _id: string;
    username: string;
    email: string;
  }; // backend returns just sellerId, not object
  createdAt: string;
  updatedAt: string;
}

interface RecentOrder {
  _id: string;
  buyerId: {
    _id?: string;
    username?: string;
    email?: string;
  };
  total: number;
  status: "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED" | "COMPLETED";
  subOrder: {
    sellerId: string;
    items: OrderItem[];
    subtotal: number;
    status: "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED" | "COMPLETED";
  };
  payment: {
    method: "ESEWA" | "KHALTI" | "COD";
    status: string; // optional, only for ESEWA and KHALTI
  }; // "ESEWA" | "KHALTI" | "COD"
  shippingInfo?: {
    name?: string;
    address?: string;
    city?: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const mockRevenueData = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 3000 },
  { month: "Mar", revenue: 5000 },
  { month: "Apr", revenue: 4500 },
  { month: "May", revenue: 6000 },
  { month: "Jun", revenue: 5500 },
];

const mockStats: SellerStats = {
  totalProducts: 0.0,
  totalOrders: 0.0,
  totalRevenue: 0.0,
  monthlyGrowth: 0.0,
  pendingOrders: 0.0,
  lowStockProducts: 0.0,
  completedOrders: 0.0,
};

function SellerDashboardContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { sellerProducts, loading } = useSelector(
    (state: RootState) => state.products
  );
  const { sellerOrders } = useSelector((state: RootState) => state.orders);
  console.log(sellerOrders);
  const [stats, setStats] = useState<SellerStats>(mockStats);
  const [revenueData, setRevenueData] = useState(mockRevenueData);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    if (user && token) {
      fetchSellerData();
      fetchSellerOrders();
    }
  }, [user, token]);

  const fetchSellerData = async () => {
    dispatch(setLoading(true));

    try {
      // Fetch seller stats
      const statsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stats/seller`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log(statsData);
        setStats(statsData.stats || mockStats);
        setRevenueData(statsData.revenueData || mockRevenueData);
      }
    } catch (error) {
      console.error("Error fetching seller data:", error);
      dispatch(setError("Failed to load dashboard data"));

      // Use mock/calculated data as fallback
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchSellerOrders = async () => {
    dispatch(setLoading(true));
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/seller`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRecentOrders(data.data.orders || []);
      } else {
        throw new Error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching seller orders:", error);
    } finally {
      dispatch(setLoading(false));
    }
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "UNPAID":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.username}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your store today.
          </p>
        </div>

        {/* Alerts */}
        {stats.lowStockProducts > 0 && (
          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <p className="text-yellow-800">
                  <strong>{stats.lowStockProducts}</strong> products are running
                  low on stock.
                  <Link
                    href="/seller/products"
                    className="ml-2 text-yellow-600 underline hover:text-yellow-700"
                  >
                    Manage inventory
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Products
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalProducts}
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Orders
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalOrders}{" "}
                    <span className="text-gray-600 text-xl">
                      ({stats.completedOrders} completed)
                    </span>
                  </p>
                  {stats.pendingOrders > 0 && (
                    <p className="text-xs text-yellow-600">
                      {stats.pendingOrders} pending
                    </p>
                  )}
                </div>
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Revenue
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    Rs. {stats.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Growth</p>
                  <p className="text-3xl font-bold text-gray-900">
                    +{stats.monthlyGrowth}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>
                Monthly revenue for the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>
                    Latest orders from your customers
                  </CardDescription>
                </div>
                <Link href="/seller/orders">
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.length > 0 ? (
                  recentOrders.slice(0, 3).map((order) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {order?.buyerId?.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {order?.buyerId?.username}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.subOrder.items.length} item
                            {order.subOrder.items.length > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          Rs. {order.subOrder.subtotal?.toLocaleString()}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge
                            className={getStatusColor(order.status)}
                            variant="secondary"
                          >
                            {order.status}
                          </Badge>
                          <Badge
                            className={getPaymentStatusColor(
                              order.payment.status
                            )}
                            variant="secondary"
                          >
                            {order.payment.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No orders yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SellerDashboard() {
  return (
    <RouteGuard allowedRoles={["seller"]}>
      <SellerDashboardContent />
    </RouteGuard>
  );
}
