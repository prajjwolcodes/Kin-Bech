"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  MapPin,
  Phone,
  ArrowLeft,
  Bell,
  Settings,
  LogOut,
  User,
  Shield,
  RefreshCw,
  FileText,
  CreditCard,
  Pen,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { logout } from "@/lib/features/auth/authSlice";
import { useRouter } from "next/navigation";
import { updatePaymentStatus } from "@/lib/features/orders/orderSlice";

// Interface matching your backend models
interface BackendUser {
  _id: string;
  username: string;
  email: string;
  role: "buyer" | "seller" | "admin";
}

interface BackendProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  count: number;
  imageUrl?: string;
  sellerId: BackendUser;
}

interface BackendOrderItem {
  _id: string;
  orderId: string;
  productId: BackendProduct;
  price: number;
  quantity: number;
  sellerId: BackendUser;
}

interface BackendPayment {
  _id: string;
  orderId: string;
  amount: number;
  method: "COD" | "ESEWA" | "KHALTI";
  status: "UNPAID" | "PAID";
  transaction_uuid?: string;
  createdAt: string;
  updatedAt: string;
}

interface BackendOrder {
  _id: string;
  buyerId: BackendUser;
  total: number;
  status: "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED" | "COMPLETED";
  shippingInfo: {
    name?: string;
    address?: string;
    city?: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
  items: BackendOrderItem[];
  payment: BackendPayment;
}

export default function AdminOrdersPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<BackendOrder | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  // Fetch orders from backend
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOrders(data.data.orders);
      } else {
        console.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyerId.username
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      order.buyerId.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesPayment =
      paymentFilter === "all" || order?.payment?.status === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "DELIVERED":
        return "bg-purple-100 text-purple-800";
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
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "COD":
        return "bg-orange-100 text-orange-800";
      case "ESEWA":
        return "bg-green-100 text-green-800";
      case "KHALTI":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleOrderAction = async (orderId: string, action: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: action }),
        }
      );

      const data = await response.json();

      console.log(data);

      if (response.ok) {
        await fetchOrders(); // Refresh the orders list
      } else {
        console.error("Failed to update order");
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const handleUpdatePaymentStatus = async (
    orderId: string,
    newStatus: string
  ) => {
    setUpdatingOrder(orderId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/updatepayment/${orderId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        dispatch(updatePaymentStatus({ orderId, status: newStatus as any }));
        await fetchOrders(); // Refresh the orders list
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to update payment status");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert("Network error. Please try again.");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const viewOrderDetails = (order: BackendOrder) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "PENDING").length,
    confirmed: orders.filter((o) => o.status === "CONFIRMED").length,
    delivered: orders.filter((o) => o.status === "DELIVERED").length,
    cancelled: orders.filter((o) => o.status === "CANCELLED").length,
    completed: orders.filter((o) => o.status === "COMPLETED").length,
    totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
    paidOrders: orders.filter((o) => o.payment?.status === "PAID").length,
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
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
                href="/admin/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300" />
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

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order Management
            </h1>
            <p className="text-gray-600">
              Monitor and manage all platform orders
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Orders
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {orderStats.total}
                </p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {orderStats.pending}
                </p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {orderStats.confirmed}
                </p>
                <p className="text-sm text-gray-600">Confirmed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {orderStats.delivered}
                </p>
                <p className="text-sm text-gray-600">Delivered</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {orderStats.cancelled}
                </p>
                <p className="text-sm text-gray-600">Cancelled</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {orderStats.completed}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {orderStats.paidOrders}
                </p>
                <p className="text-sm text-gray-600">Paid</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
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
                    placeholder="Search orders, buyers, or emails..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="UNPAID">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Orders ({filteredOrders.length})</CardTitle>
            <CardDescription>
              Monitor and manage all platform orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">
                      {order._id.slice(-8)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-2">
                        {[
                          ...new Map(
                            order.items.map((item) => [
                              item.productId?.sellerId?._id,
                              item.productId?.sellerId,
                            ])
                          ).values(),
                        ].map((seller) => (
                          <div
                            key={seller?._id}
                            className="flex items-center space-x-2"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={`/placeholder.svg?height=32&width=32&text=${seller?.username
                                  ?.charAt(0)
                                  .toUpperCase()}`}
                                alt={seller?.username}
                              />
                              <AvatarFallback>
                                {seller?.username?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {seller?.username}
                              </p>
                              <p className="text-xs text-gray-500">
                                {seller?.email}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {order.items.slice(0, 2).map((item) => (
                          <Image
                            key={item._id}
                            src={
                              item.productId.imageUrl ||
                              "/placeholder.svg?height=30&width=30&text=Product"
                            }
                            alt={item.productId.name}
                            width={30}
                            height={30}
                            className="rounded object-cover"
                          />
                        ))}
                        {order.items.length > 2 && (
                          <span className="text-sm text-gray-500">
                            +{order.items.length - 2}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₹{order.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-4">
                        <Badge
                          className={getPaymentStatusColor(
                            order?.payment?.status || "PENDING"
                          )}
                        >
                          {order?.payment?.status || "PENDING"}
                        </Badge>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              disabled={updatingOrder === order._id}
                            >
                              {updatingOrder === order._id ? (
                                <Pen className="h-4 w-4 animate-spin" />
                              ) : (
                                <Pen className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdatePaymentStatus(order._id, "PAID")
                              }
                            >
                              PAID
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdatePaymentStatus(order._id, "UNPAID")
                              }
                            >
                              UNPAID
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getPaymentMethodColor(
                          order?.payment?.method || "PENDING"
                        )}
                      >
                        {order?.payment?.method || "PENDING"}
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
                          <DropdownMenuItem
                            onClick={() => viewOrderDetails(order)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh Status
                          </DropdownMenuItem>
                          {order.status === "PENDING" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleOrderAction(order._id, "CONFIRMED")
                              }
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Confirm Order
                            </DropdownMenuItem>
                          )}
                          {order.status === "CONFIRMED" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleOrderAction(order._id, "DELIVERED")
                              }
                            >
                              <Truck className="mr-2 h-4 w-4" />
                              Mark Delivered
                            </DropdownMenuItem>
                          )}
                          {(order.status === "PENDING" ||
                            order.status === "CONFIRMED") && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleOrderAction(order._id, "CANCELLED")
                              }
                              className="text-red-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancel Order
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            Generate Invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">
                  No orders found matching your criteria.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details Dialog */}
        <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
          <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Order Details - {selectedOrder?._id.slice(-8)}
              </DialogTitle>
              <DialogDescription>
                Complete information about this order
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="products">Products</TabsTrigger>
                  <TabsTrigger value="shipping">Shipping</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  {/* Order Status */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="font-semibold">Order Status</h4>
                        <Badge className={getStatusColor(selectedOrder.status)}>
                          {selectedOrder.status}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-semibold">Payment Status</h4>
                        <Badge
                          className={getPaymentStatusColor(
                            selectedOrder.payment.status
                          )}
                        >
                          {selectedOrder.payment.status}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-semibold">Payment Method</h4>
                        <Badge
                          className={getPaymentMethodColor(
                            selectedOrder.payment.method
                          )}
                        >
                          {selectedOrder.payment.method}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold">
                        ₹{selectedOrder.total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Buyer Information */}
                  <div>
                    <h4 className="font-semibold mb-3">Buyer Information</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={`/placeholder.svg?height=40&width=40&text=${selectedOrder.buyerId.username
                              .charAt(0)
                              .toUpperCase()}`}
                            alt={selectedOrder.buyerId.username}
                          />
                          <AvatarFallback>
                            {selectedOrder.buyerId.username
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {selectedOrder.buyerId.username}
                          </p>
                          <p className="text-sm text-gray-600">
                            {selectedOrder.buyerId.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div>
                    <h4 className="font-semibold mb-3">Payment Information</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Total Amount:</span>
                            <span>₹{selectedOrder.total.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Payment Amount:</span>
                            <span>
                              ₹{selectedOrder.payment.amount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="h-4 w-4 text-gray-400" />
                            <span>Method: {selectedOrder.payment.method}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span>
                              Status: {selectedOrder?.payment?.status}
                            </span>
                          </div>
                          {selectedOrder.payment.transaction_uuid && (
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span>
                                Transaction:{" "}
                                {selectedOrder.payment.transaction_uuid}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>
                              Order Date:{" "}
                              {new Date(
                                selectedOrder.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="products" className="space-y-4">
                  <div className="space-y-4">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <Image
                            src={
                              item.productId.imageUrl ||
                              "/placeholder.svg?height=80&width=80&text=Product"
                            }
                            alt={item.productId.name}
                            width={80}
                            height={80}
                            className="rounded object-cover"
                          />
                          <div>
                            <p className="font-medium">{item.productId.name}</p>
                            <p className="text-sm text-gray-500">
                              {item.productId.description}
                            </p>
                            <p className="text-sm text-gray-500">
                              Quantity: {item.quantity}
                            </p>
                            <p className="text-sm text-gray-500">
                              Unit Price: ₹{item.price.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                              Seller: {item.sellerId.username}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Stock: {item.productId.count}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="shipping" className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">Shipping Information</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {selectedOrder.shippingInfo.name ||
                      selectedOrder.shippingInfo.address ? (
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            {selectedOrder.shippingInfo.name && (
                              <p className="font-medium">
                                {selectedOrder.shippingInfo.name}
                              </p>
                            )}
                            {selectedOrder.shippingInfo.address && (
                              <p>{selectedOrder.shippingInfo.address}</p>
                            )}
                            {selectedOrder.shippingInfo.city && (
                              <p>{selectedOrder.shippingInfo.city}</p>
                            )}
                            {selectedOrder.shippingInfo.phone && (
                              <div className="flex items-center space-x-2 mt-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span>{selectedOrder.shippingInfo.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <MapPin className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-gray-500">
                            No shipping information provided
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Timeline */}
                  <div>
                    <h4 className="font-semibold mb-3">Order Timeline</h4>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full" />
                          <div className="w-px h-8 bg-gray-300 mt-2" />
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between">
                            <Badge className={getStatusColor("PENDING")}>
                              Order Placed
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(
                                selectedOrder.createdAt
                              ).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">
                            Order has been placed and is awaiting confirmation
                          </p>
                        </div>
                      </div>

                      {selectedOrder.status !== "PENDING" && (
                        <div className="flex items-start space-x-4">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                selectedOrder.status === "CANCELLED"
                                  ? "bg-red-500"
                                  : "bg-green-500"
                              }`}
                            />
                            {selectedOrder.status !== "CANCELLED" &&
                              selectedOrder.status !== "DELIVERED" &&
                              selectedOrder.status !== "COMPLETED" && (
                                <div className="w-px h-8 bg-gray-300 mt-2" />
                              )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center justify-between">
                              <Badge
                                className={getStatusColor(selectedOrder.status)}
                              >
                                {selectedOrder.status}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {new Date(
                                  selectedOrder.updatedAt
                                ).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">
                              {selectedOrder.status === "CONFIRMED" &&
                                "Order has been confirmed by seller"}
                              {selectedOrder.status === "DELIVERED" &&
                                "Order has been delivered successfully"}
                              {selectedOrder.status === "CANCELLED" &&
                                "Order has been cancelled"}
                              {selectedOrder.status === "COMPLETED" &&
                                "Order has been completed"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsOrderDetailOpen(false)}
              >
                Close
              </Button>
              {selectedOrder?.status === "PENDING" && (
                <Button
                  onClick={() =>
                    handleOrderAction(selectedOrder._id, "CONFIRMED")
                  }
                >
                  Confirm Order
                </Button>
              )}
              {selectedOrder?.status === "CONFIRMED" && (
                <Button
                  onClick={() =>
                    handleOrderAction(selectedOrder._id, "DELIVERED")
                  }
                >
                  Mark Delivered
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
