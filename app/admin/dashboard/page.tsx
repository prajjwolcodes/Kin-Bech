"use client";

import { RouteGuard } from "@/components/auth/routeGuard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { logout } from "@/lib/features/auth/authSlice";
import type { RootState } from "@/lib/store";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Mock data for admin dashboard
const mockUsers = [
  {
    _id: "1",
    username: "john_doe",
    email: "john@example.com",
    role: "buyer",
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    _id: "2",
    username: "jane_seller",
    email: "jane@example.com",
    role: "seller",
    createdAt: "2024-01-10T00:00:00Z",
  },
  {
    _id: "3",
    username: "mike_buyer",
    email: "mike@example.com",
    role: "buyer",
    createdAt: "2024-01-08T00:00:00Z",
  },
];

const mockAllOrders = [
  {
    _id: "ORD-001",
    buyerId: { username: "john_doe" },
    total: 99.99,
    status: "DELIVERED",
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    _id: "ORD-002",
    buyerId: { username: "jane_smith" },
    total: 29.99,
    status: "PENDING",
    createdAt: "2024-01-14T00:00:00Z",
  },
];

const mockPlatformAnalytics = {
  totalUsers: 0,
  totalSellers: 0,
  totalBuyers: 0,
  totalOrders: 0,
  completedOrders: 0,
  totalRevenue: 0,
  platformCommission: 0,
  activeUsers: 0,
  newUsersThisMonth: 0,
  orderGrowth: 0,
  revenueGrowth: 0,
};

const mockRevenueData = [
  { month: "Jan", revenue: 8500, commission: 850, orders: 145 },
  { month: "Feb", revenue: 9200, commission: 920, orders: 167 },
  { month: "Mar", revenue: 11000, commission: 1100, orders: 198 },
  { month: "Apr", revenue: 10500, commission: 1050, orders: 189 },
  { month: "May", revenue: 13500, commission: 1350, orders: 234 },
  { month: "Jun", revenue: 12800, commission: 1280, orders: 221 },
];

const mockUserGrowthData = [
  { month: "Jan", buyers: 120, sellers: 8 },
  { month: "Feb", buyers: 145, sellers: 12 },
  { month: "Mar", buyers: 167, sellers: 15 },
  { month: "Apr", buyers: 189, sellers: 18 },
  { month: "May", buyers: 210, sellers: 22 },
  { month: "Jun", buyers: 234, sellers: 25 },
];

const categoryData = [
  { name: "Electronics", value: 40, color: "#3B82F6" },
  { name: "Clothing", value: 25, color: "#8B5CF6" },
  { name: "Home & Garden", value: 20, color: "#10B981" },
  { name: "Sports", value: 15, color: "#F59E0B" },
];

const mockRecentActivity = [
  {
    type: "payment",
    message: "User reported issue: Payment of Rs. 420.00 failed",
    time: "2025-08-05T02:17:28.780Z",
    color: "yellow",
  },
  {
    type: "payment",
    message: "User reported issue: Payment of Rs. 200.00 failed",
    time: "2025-08-05T01:41:52.480Z",
    color: "yellow",
  },
  {
    type: "order",
    message: "Large order completed: Rs. 1200.00",
    time: "2025-08-04T13:19:52.389Z",
    color: "blue",
  },
];

function AdminDashboardContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [platformAnalytics, setPlatformAnalytics] = useState(
    mockPlatformAnalytics
  );
  const [revenueData, setRevenueData] = useState(mockRevenueData);
  const [userGrowthData, setUserGrowthData] = useState(mockUserGrowthData);
  const [recentActivity, setRecentActivity] = useState(mockRecentActivity);

  const [activeTab, setActiveTab] = useState("overview");
  const [userFilter, setUserFilter] = useState("all");
  const [orderFilter, setOrderFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Simulate fetching initial data
    async function fetchData() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/stats`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }
        const data = await response.json();
        setPlatformAnalytics(data.platformAnalytics);
        setRevenueData(data.revenueData);
        setUserGrowthData(data.userGrowthData);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/stats/recent-activity`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch recent activity");
        }
        const data = await response.json();
        setRecentActivity(data.activities);
      } catch (error) {
        console.error("Error fetching recent activity:", error);
      }
    }

    fetchRecentActivity();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = userFilter === "all" || user.role === userFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredOrders = mockAllOrders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyerId.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = orderFilter === "all" || order.status === orderFilter;
    return matchesSearch && matchesFilter;
  });

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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "seller":
        return "bg-purple-100 text-purple-800";
      case "buyer":
        return "bg-blue-100 text-blue-800";
      case "admin":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gray-50">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage and monitor the entire KinBech platform
          </p>
        </div>

        {/* Overview Tab */}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {platformAnalytics.totalUsers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +{platformAnalytics.newUsersThisMonth} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex gap-2">
                {platformAnalytics.totalOrders.toLocaleString()}
                <span className="text-gray-600 ">
                  ({platformAnalytics.completedOrders.toLocaleString()}{" "}
                  completed)
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {platformAnalytics.orderGrowth >= 0 ? "+ %" : ""}
                {platformAnalytics.orderGrowth} from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Platform Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rs. {platformAnalytics.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {platformAnalytics.revenueGrowth >= 0 ? "+ %" : ""}
                {platformAnalytics.revenueGrowth} from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Commission Earned
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rs. {platformAnalytics.platformCommission.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                5% commission rate
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Platform Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Revenue & Commission</CardTitle>
              <CardDescription>
                Monthly revenue and commission trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    name="Total Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="commission"
                    stroke="#10B981"
                    strokeWidth={3}
                    name="Commission"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Growth */}
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>
                New buyers and sellers joining the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="buyers"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    name="Buyers"
                  />
                  <Area
                    type="monotone"
                    dataKey="sellers"
                    stackId="1"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    name="Sellers"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Platform Activity</CardTitle>
            <CardDescription>
              Latest user registrations and orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => (
                <div
                  key={idx}
                  className={`flex items-center space-x-4 p-3 rounded-lg bg-${activity.color}-50`}
                >
                  <div
                    className={`w-2 h-2 rounded-full bg-${activity.color}-500`}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.time).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <RouteGuard allowedRoles={["admin"]}>
      <AdminDashboardContent />
    </RouteGuard>
  );
}
