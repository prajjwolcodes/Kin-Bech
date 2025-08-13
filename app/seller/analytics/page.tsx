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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  RefreshCw,
  Download,
  Calendar,
  Bell,
  LogOut,
  ArrowUpRight,
  ArrowDownRight,
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

interface AnalyticsOverview {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueGrowth: number;
  ordersGrowth: number;
  productsGrowth: number;
  customersGrowth: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface TopProduct {
  _id: string;
  name: string;
  imageUrl: string;
  totalSold: number;
  revenue: number;
  category: string;
}

interface CustomerAnalytics {
  newCustomers: number;
  returningCustomers: number;
  totalCustomers: number;
}

interface DailySales {
  date: string;
  sales: number;
  orders: number;
}

// Mock data for development
const mockOverview: AnalyticsOverview = {
  totalRevenue: 45230.5,
  totalOrders: 342,
  totalProducts: 28,
  totalCustomers: 156,
  revenueGrowth: 12.5,
  ordersGrowth: 8.3,
  productsGrowth: 5.2,
  customersGrowth: 15.7,
};

const mockRevenueData: RevenueData[] = [
  { month: "Jan", revenue: 4200, orders: 28 },
  { month: "Feb", revenue: 3800, orders: 25 },
  { month: "Mar", revenue: 5200, orders: 35 },
  { month: "Apr", revenue: 4800, orders: 32 },
  { month: "May", revenue: 6100, orders: 41 },
  { month: "Jun", revenue: 5500, orders: 37 },
];

const mockCategoryData: CategoryData[] = [
  { name: "Electronics", value: 35, color: "#0088FE" },
  { name: "Clothing", value: 25, color: "#00C49F" },
  { name: "Books", value: 20, color: "#FFBB28" },
  { name: "Home & Garden", value: 15, color: "#FF8042" },
  { name: "Sports", value: 5, color: "#8884D8" },
];

const mockTopProducts: TopProduct[] = [
  {
    _id: "1",
    name: "Wireless Bluetooth Headphones",
    imageUrl: "/placeholder.svg?height=50&width=50&text=Headphones",
    totalSold: 45,
    revenue: 4495.5,
    category: "Electronics",
  },
  {
    _id: "2",
    name: "Smart Fitness Watch",
    imageUrl: "/placeholder.svg?height=50&width=50&text=Watch",
    totalSold: 32,
    revenue: 6398.0,
    category: "Electronics",
  },
  {
    _id: "3",
    name: "Premium Cotton T-Shirt",
    imageUrl: "/placeholder.svg?height=50&width=50&text=Shirt",
    totalSold: 78,
    revenue: 2340.0,
    category: "Clothing",
  },
];

const mockCustomerAnalytics: CustomerAnalytics = {
  newCustomers: 89,
  returningCustomers: 67,
  totalCustomers: 156,
};

const mockDailySales: DailySales[] = [
  { date: "Mon", sales: 1200, orders: 8 },
  { date: "Tue", sales: 1800, orders: 12 },
  { date: "Wed", sales: 1500, orders: 10 },
  { date: "Thu", sales: 2200, orders: 15 },
  { date: "Fri", sales: 2800, orders: 19 },
  { date: "Sat", sales: 3200, orders: 22 },
  { date: "Sun", sales: 2100, orders: 14 },
];

function SellerAnalyticsContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("6months");
  const [overview, setOverview] = useState<AnalyticsOverview>(mockOverview);
  const [revenueData, setRevenueData] =
    useState<RevenueData[]>(mockRevenueData);
  const [categoryData, setCategoryData] =
    useState<CategoryData[]>(mockCategoryData);
  const [topProducts, setTopProducts] = useState<TopProduct[]>(mockTopProducts);
  const [customerAnalytics, setCustomerAnalytics] = useState<CustomerAnalytics>(
    mockCustomerAnalytics
  );
  const [dailySales, setDailySales] = useState<DailySales[]>(mockDailySales);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch overview analytics
      const overviewResponse = await fetch(
        `/api/seller/analytics/overview?timeRange=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json();
        setOverview(overviewData);
      }

      // Fetch revenue trends
      const revenueResponse = await fetch(
        `/api/seller/analytics/revenue?timeRange=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (revenueResponse.ok) {
        const revenueData = await revenueResponse.json();
        setRevenueData(revenueData.data);
      }

      // Fetch category distribution
      const categoryResponse = await fetch(
        `/api/seller/analytics/categories?timeRange=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json();
        setCategoryData(categoryData.data);
      }

      // Fetch top products
      const productsResponse = await fetch(
        `/api/seller/analytics/top-products?timeRange=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setTopProducts(productsData.products);
      }

      // Fetch customer analytics
      const customerResponse = await fetch(
        `/api/seller/analytics/customers?timeRange=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (customerResponse.ok) {
        const customerData = await customerResponse.json();
        setCustomerAnalytics(customerData);
      }

      // Fetch daily sales
      const dailyResponse = await fetch(
        `/api/seller/analytics/daily-sales?timeRange=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (dailyResponse.ok) {
        const dailyData = await dailyResponse.json();
        setDailySales(dailyData.data);
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      // Keep mock data as fallback
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const handleExportReport = async () => {
    try {
      const response = await fetch(
        `/api/seller/analytics/export?timeRange=${timeRange}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `analytics-report-${timeRange}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error exporting report:", error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <ArrowUpRight className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-600" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Track your business performance and insights
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <Calendar className="mr-2 h-4 w-4" />
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
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button onClick={handleExportReport}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(overview.totalRevenue)}
              </div>
              <div
                className={`flex items-center text-xs ${getGrowthColor(
                  overview.revenueGrowth
                )}`}
              >
                {getGrowthIcon(overview.revenueGrowth)}
                <span className="ml-1">
                  {Math.abs(overview.revenueGrowth)}% from last period
                </span>
              </div>
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
              <div className="text-2xl font-bold">
                {overview.totalOrders.toLocaleString()}
              </div>
              <div
                className={`flex items-center text-xs ${getGrowthColor(
                  overview.ordersGrowth
                )}`}
              >
                {getGrowthIcon(overview.ordersGrowth)}
                <span className="ml-1">
                  {Math.abs(overview.ordersGrowth)}% from last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.totalProducts}</div>
              <div
                className={`flex items-center text-xs ${getGrowthColor(
                  overview.productsGrowth
                )}`}
              >
                {getGrowthIcon(overview.productsGrowth)}
                <span className="ml-1">
                  {Math.abs(overview.productsGrowth)}% from last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Customers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview.totalCustomers}
              </div>
              <div
                className={`flex items-center text-xs ${getGrowthColor(
                  overview.customersGrowth
                )}`}
              >
                {getGrowthIcon(overview.customersGrowth)}
                <span className="ml-1">
                  {Math.abs(overview.customersGrowth)}% from last period
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>
                Monthly revenue and order trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "revenue"
                        ? formatCurrency(Number(value))
                        : value,
                      name === "revenue" ? "Revenue" : "Orders",
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#82ca9d"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Daily Sales */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Sales</CardTitle>
              <CardDescription>
                Sales performance over the last week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "sales" ? formatCurrency(Number(value)) : value,
                      name === "sales" ? "Sales" : "Orders",
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="sales" fill="#8884d8" />
                  <Bar dataKey="orders" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>
                Distribution of sales across product categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>
                Your best-selling products this period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div
                    key={product._id}
                    className="flex items-center space-x-4 p-4 border rounded-lg"
                  >
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold">
                      {index + 1}
                    </div>
                    <Image
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.name}
                      width={50}
                      height={50}
                      className="rounded object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{product.name}</h4>
                      <p className="text-sm text-gray-500">
                        {product.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(product.revenue)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product.totalSold} sold
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Analytics */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Customer Analytics</CardTitle>
              <CardDescription>
                Insights about your customer base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {customerAnalytics.newCustomers}
                  </div>
                  <p className="text-sm text-gray-500">New Customers</p>
                  <Badge variant="secondary" className="mt-2">
                    {(
                      (customerAnalytics.newCustomers /
                        customerAnalytics.totalCustomers) *
                      100
                    ).toFixed(1)}
                    %
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {customerAnalytics.returningCustomers}
                  </div>
                  <p className="text-sm text-gray-500">Returning Customers</p>
                  <Badge variant="secondary" className="mt-2">
                    {(
                      (customerAnalytics.returningCustomers /
                        customerAnalytics.totalCustomers) *
                      100
                    ).toFixed(1)}
                    %
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {customerAnalytics.totalCustomers}
                  </div>
                  <p className="text-sm text-gray-500">Total Customers</p>
                  <Badge variant="outline" className="mt-2">
                    Active Base
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights and Recommendations */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Business Insights</CardTitle>
              <CardDescription>
                AI-powered recommendations for your business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900">
                      Revenue Growth Opportunity
                    </h4>
                    <p className="text-sm text-blue-700">
                      Your electronics category is performing{" "}
                      {overview.revenueGrowth > 0
                        ? "exceptionally well"
                        : "below average"}
                      . Consider{" "}
                      {overview.revenueGrowth > 0
                        ? "expanding your electronics inventory"
                        : "reviewing your pricing strategy"}
                      .
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                  <Users className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900">
                      Customer Retention
                    </h4>
                    <p className="text-sm text-green-700">
                      {(
                        (customerAnalytics.returningCustomers /
                          customerAnalytics.totalCustomers) *
                        100
                      ).toFixed(1)}
                      % of your customers are returning buyers. Consider
                      implementing a loyalty program to increase retention.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                  <Package className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-purple-900">
                      Product Performance
                    </h4>
                    <p className="text-sm text-purple-700">
                      Your top product "{topProducts[0]?.name}" accounts for a
                      significant portion of sales. Consider creating similar
                      products or bundles to maximize revenue.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SellerAnalyticsPage() {
  return (
    <RouteGuard allowedRoles={["seller"]}>
      <SellerAnalyticsContent />
    </RouteGuard>
  );
}
