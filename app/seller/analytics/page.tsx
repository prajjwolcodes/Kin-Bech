"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
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
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Download,
  ArrowLeft,
  Bell,
  Settings,
  LogOut,
  User,
  Target,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  productsSold: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  productsSoldChange: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
  customers: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
  revenue: number;
}

interface TopProduct {
  _id: string;
  name: string;
  sales: number;
  revenue: number;
  trend: "up" | "down";
  imageUrl: string;
  category: string;
}

interface CustomerAnalytics {
  month: string;
  new: number;
  returning: number;
  total: number;
}

interface DailySales {
  day: string;
  sales: number;
  orders: number;
}

export default function SellerAnalyticsPage() {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [timeRange, setTimeRange] = useState("6months");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [customerData, setCustomerData] = useState<CustomerAnalytics[]>([]);
  const [dailySalesData, setDailySalesData] = useState<DailySales[]>([]);

  // Fetch analytics data from backend
  const fetchAnalyticsData = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Fetch main analytics stats
      const analyticsResponse = await fetch(
        `/api/seller/analytics/overview?period=${timeRange}`,
        {
          headers,
        }
      );

      if (analyticsResponse.ok) {
        const analytics = await analyticsResponse.json();
        setAnalyticsData(analytics.data);
      }

      // Fetch revenue trend data
      const revenueResponse = await fetch(
        `/api/seller/analytics/revenue?period=${timeRange}`,
        {
          headers,
        }
      );

      if (revenueResponse.ok) {
        const revenue = await revenueResponse.json();
        setRevenueData(revenue.data);
      }

      // Fetch category distribution
      const categoryResponse = await fetch(
        `/api/seller/analytics/categories?period=${timeRange}`,
        {
          headers,
        }
      );

      if (categoryResponse.ok) {
        const categories = await categoryResponse.json();
        setCategoryData(categories.data);
      }

      // Fetch top products
      const productsResponse = await fetch(
        `/api/seller/analytics/top-products?period=${timeRange}`,
        {
          headers,
        }
      );

      if (productsResponse.ok) {
        const products = await productsResponse.json();
        setTopProducts(products.data);
      }

      // Fetch customer analytics
      const customerResponse = await fetch(
        `/api/seller/analytics/customers?period=${timeRange}`,
        {
          headers,
        }
      );

      if (customerResponse.ok) {
        const customers = await customerResponse.json();
        setCustomerData(customers.data);
      }

      // Fetch daily sales
      const dailyResponse = await fetch(
        `/api/seller/analytics/daily-sales?period=${timeRange}`,
        {
          headers,
        }
      );

      if (dailyResponse.ok) {
        const daily = await dailyResponse.json();
        setDailySalesData(daily.data);
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      // Fallback to mock data for development
      setAnalyticsData({
        totalRevenue: 28450,
        totalOrders: 217,
        totalCustomers: 126,
        productsSold: 389,
        revenueChange: 12.5,
        ordersChange: 8.2,
        customersChange: 15.3,
        productsSoldChange: -2.1,
      });

      setRevenueData([
        { month: "Jan", revenue: 4000, orders: 24, customers: 18 },
        { month: "Feb", revenue: 3000, orders: 18, customers: 15 },
        { month: "Mar", revenue: 5000, orders: 32, customers: 28 },
        { month: "Apr", revenue: 4500, orders: 28, customers: 25 },
        { month: "May", revenue: 6000, orders: 38, customers: 32 },
        { month: "Jun", revenue: 5500, orders: 35, customers: 30 },
      ]);

      setCategoryData([
        { name: "Electronics", value: 45, color: "#3B82F6", revenue: 12500 },
        { name: "Clothing", value: 30, color: "#8B5CF6", revenue: 8200 },
        { name: "Home & Garden", value: 15, color: "#10B981", revenue: 4100 },
        { name: "Sports", value: 10, color: "#F59E0B", revenue: 2800 },
      ]);

      setTopProducts([
        {
          _id: "1",
          name: "Wireless Headphones",
          sales: 45,
          revenue: 4499,
          trend: "up",
          imageUrl: "/placeholder.svg?height=40&width=40",
          category: "Electronics",
        },
        {
          _id: "2",
          name: "Smart Watch",
          sales: 32,
          revenue: 6399,
          trend: "up",
          imageUrl: "/placeholder.svg?height=40&width=40",
          category: "Electronics",
        },
        {
          _id: "3",
          name: "Bluetooth Speaker",
          sales: 28,
          revenue: 2239,
          trend: "down",
          imageUrl: "/placeholder.svg?height=40&width=40",
          category: "Electronics",
        },
      ]);

      setCustomerData([
        { month: "Jan", new: 12, returning: 8, total: 20 },
        { month: "Feb", new: 8, returning: 10, total: 18 },
        { month: "Mar", new: 15, returning: 17, total: 32 },
        { month: "Apr", new: 11, returning: 17, total: 28 },
        { month: "May", new: 18, returning: 20, total: 38 },
        { month: "Jun", new: 14, returning: 21, total: 35 },
      ]);

      setDailySalesData([
        { day: "Mon", sales: 120, orders: 8 },
        { day: "Tue", sales: 190, orders: 12 },
        { day: "Wed", sales: 300, orders: 18 },
        { day: "Thu", sales: 250, orders: 15 },
        { day: "Fri", sales: 400, orders: 25 },
        { day: "Sat", sales: 350, orders: 22 },
        { day: "Sun", sales: 280, orders: 17 },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAnalyticsData();
    }
  }, [token, timeRange]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
  };

  const handleExportReport = async () => {
    try {
      const response = await fetch(
        `/api/seller/analytics/export?period=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `analytics-report-${timeRange}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error exporting report:", error);
    }
  };

  const stats = analyticsData
    ? [
        {
          title: "Total Revenue",
          value: `$${analyticsData.totalRevenue.toLocaleString()}`,
          change: `${analyticsData.revenueChange > 0 ? "+" : ""}${
            analyticsData.revenueChange
          }%`,
          trend: analyticsData.revenueChange > 0 ? "up" : "down",
          icon: DollarSign,
          color: "text-green-600",
          description: "vs last period",
        },
        {
          title: "Total Orders",
          value: analyticsData.totalOrders.toString(),
          change: `${analyticsData.ordersChange > 0 ? "+" : ""}${
            analyticsData.ordersChange
          }%`,
          trend: analyticsData.ordersChange > 0 ? "up" : "down",
          icon: ShoppingCart,
          color: "text-blue-600",
          description: "vs last period",
        },
        {
          title: "Total Customers",
          value: analyticsData.totalCustomers.toString(),
          change: `${analyticsData.customersChange > 0 ? "+" : ""}${
            analyticsData.customersChange
          }%`,
          trend: analyticsData.customersChange > 0 ? "up" : "down",
          icon: Users,
          color: "text-purple-600",
          description: "vs last period",
        },
        {
          title: "Products Sold",
          value: analyticsData.productsSold.toString(),
          change: `${analyticsData.productsSoldChange > 0 ? "+" : ""}${
            analyticsData.productsSoldChange
          }%`,
          trend: analyticsData.productsSoldChange > 0 ? "up" : "down",
          icon: Package,
          color: "text-orange-600",
          description: "vs last period",
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-24" />
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[300px] w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
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
            {/* Logo & Back */}
            <div className="flex items-center space-x-4">
              <Link
                href="/seller/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">K</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  KinBech
                </span>
                <Badge variant="secondary" className="ml-2">
                  Seller
                </Badge>
              </div>
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
                        src="/placeholder-user.jpg"
                        alt={user?.username}
                      />
                      <AvatarFallback>
                        {user?.username?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
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
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Track your store performance and insights
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="3months">Last 3 months</SelectItem>
                <SelectItem value="6months">Last 6 months</SelectItem>
                <SelectItem value="1year">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExportReport}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs">
                  {stat.trend === "up" ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
                  )}
                  <span
                    className={
                      stat.trend === "up" ? "text-green-600" : "text-red-600"
                    }
                  >
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    {stat.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Orders Trend</CardTitle>
              <CardDescription>
                Monthly revenue and order trends over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="right"
                    dataKey="orders"
                    fill="#8B5CF6"
                    name="Orders"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    name="Revenue ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Daily Sales */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Sales Performance</CardTitle>
              <CardDescription>
                Sales performance by day of the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#10B981" name="Sales ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>
                Distribution of sales across product categories
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

          {/* Customer Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Analytics</CardTitle>
              <CardDescription>
                New vs returning customers over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={customerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="new"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    name="New Customers"
                  />
                  <Area
                    type="monotone"
                    dataKey="returning"
                    stackId="1"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    name="Returning Customers"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Products Performance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>
              Your best performing products this period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                      {index + 1}
                    </div>
                    <img
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-semibold">{product.name}</h4>
                      <p className="text-sm text-gray-600">
                        {product.sales} units sold • {product.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-bold">
                        ${product.revenue.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Revenue</p>
                    </div>
                    {product.trend === "up" ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Key Insights & Recommendations</CardTitle>
            <CardDescription>
              AI-powered insights about your store performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData && analyticsData.revenueChange > 0 && (
                <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-800">
                      Strong Growth Trend
                    </h4>
                    <p className="text-sm text-green-700">
                      Your revenue has increased by{" "}
                      {analyticsData.revenueChange}% compared to the previous
                      period.
                      {categoryData.length > 0 &&
                        ` ${categoryData[0].name} category is performing exceptionally well with ${categoryData[0].value}% of total sales.`}
                    </p>
                  </div>
                </div>
              )}

              {analyticsData && analyticsData.customersChange > 10 && (
                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800">
                      Customer Growth Success
                    </h4>
                    <p className="text-sm text-blue-700">
                      Your customer base has grown by{" "}
                      {analyticsData.customersChange}% this period. Consider
                      implementing a loyalty program to increase retention and
                      encourage repeat purchases.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800">
                    Inventory Management
                  </h4>
                  <p className="text-sm text-yellow-700">
                    Monitor your top-selling products closely to avoid
                    stockouts.
                    {topProducts.length > 0 &&
                      ` Products like ${topProducts[0].name} are in high demand and may need restocking soon.`}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                <Target className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-purple-800">
                    Optimization Opportunity
                  </h4>
                  <p className="text-sm text-purple-700">
                    Analyze your daily sales patterns to identify peak
                    performance days. Consider running targeted promotions
                    during high-traffic periods to maximize revenue potential.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
