"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/lib/store";
import { logout } from "@/lib/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  TrendingUp,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  Bell,
  Settings,
  LogOut,
  User,
  Shield,
  Eye,
  Ban,
  Store,
  Activity,
} from "lucide-react";
import { RouteGuard } from "@/components/auth/routeGuard";
import { useRouter } from "next/navigation";

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
    message: "User reported issue: Payment of ₹420.00 failed",
    time: "2025-08-05T02:17:28.780Z",
    color: "yellow",
  },
  {
    type: "payment",
    message: "User reported issue: Payment of ₹200.00 failed",
    time: "2025-08-05T01:41:52.480Z",
    color: "yellow",
  },
  {
    type: "order",
    message: "Large order completed: ₹1200.00",
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                KinBech
              </span>
              <Badge variant="destructive" className="ml-2">
                Admin
              </Badge>
            </div>

            {/* Right Side */}
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
                        src="/placeholder-admin.jpg"
                        alt={user?.username}
                      />
                      <AvatarFallback>
                        <Shield className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Admin Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Platform Settings</span>
                  </DropdownMenuItem>
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

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="orders">Order Management</TabsTrigger>
            <TabsTrigger value="analytics">Platform Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
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
                    ₹{platformAnalytics.totalRevenue.toLocaleString()}
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
                    ₹{platformAnalytics.platformCommission.toLocaleString()}
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
                        <p className="text-sm font-medium">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.time).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {platformAnalytics.totalBuyers}
                    </p>
                    <p className="text-sm text-gray-600">Total Buyers</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {platformAnalytics.totalSellers}
                    </p>
                    <p className="text-sm text-gray-600">Total Sellers</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {platformAnalytics.activeUsers}
                    </p>
                    <p className="text-sm text-gray-600">Active Users</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">0</p>
                    <p className="text-sm text-gray-600">Pending Approval</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  User Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search users..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter users" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="buyer">Buyers</SelectItem>
                      <SelectItem value="seller">Sellers</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>User Management ({filteredUsers.length})</CardTitle>
                <CardDescription>
                  Manage all platform users and their accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {user.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.username}</p>
                              <p className="text-sm text-gray-500">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(user.role)}>
                            {user.role.charAt(0).toUpperCase() +
                              user.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Ban className="mr-2 h-4 w-4" />
                                Suspend User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            {/* Order Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {mockAllOrders.length}
                    </p>
                    <p className="text-sm text-gray-600">Total Orders</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {
                        mockAllOrders.filter((o) => o.status === "PENDING")
                          .length
                      }
                    </p>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">0</p>
                    <p className="text-sm text-gray-600">Shipped</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {
                        mockAllOrders.filter((o) => o.status === "DELIVERED")
                          .length
                      }
                    </p>
                    <p className="text-sm text-gray-600">Delivered</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  Order Filters
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
                  <Select value={orderFilter} onValueChange={setOrderFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter orders" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Orders</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="DELIVERED">Delivered</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Orders Table */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Order Management ({filteredOrders.length})
                </CardTitle>
                <CardDescription>
                  Monitor and manage all platform orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">
                          {order._id}
                        </TableCell>
                        <TableCell>{order.buyerId.username}</TableCell>
                        <TableCell className="font-semibold">
                          ₹{order.total}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Activity className="mr-2 h-4 w-4" />
                                Track Order
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Category</CardTitle>
                  <CardDescription>
                    Platform-wide category performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Monthly Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Order Volume</CardTitle>
                  <CardDescription>
                    Total orders processed each month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#3B82F6" name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Platform Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Insights</CardTitle>
                <CardDescription>
                  Key metrics and recommendations for platform growth
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-800">
                        Strong Platform Growth
                      </h4>
                      <p className="text-sm text-green-700">
                        Platform revenue has grown by 15% this month.
                        Electronics category is leading with 40% of total sales.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-800">
                        User Acquisition Success
                      </h4>
                      <p className="text-sm text-blue-700">
                        156 new users joined this month, with a healthy 7:1
                        buyer to seller ratio. Consider seller incentive
                        programs.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                    <Store className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-purple-800">
                        Commission Optimization
                      </h4>
                      <p className="text-sm text-purple-700">
                        Current 10% commission rate is generating ₹
                        {platformAnalytics.platformCommission.toLocaleString()}{" "}
                        monthly. Consider tiered commission structure for
                        high-volume sellers.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
