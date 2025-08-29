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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { logout } from "@/lib/features/auth/authSlice";
import {
  setError,
  setLoading,
  setSellerOrders,
  updateOrderStatus,
} from "@/lib/features/orders/orderSlice";
import type { RootState } from "@/lib/store";
import {
  CheckCircle,
  Download,
  Eye,
  Filter,
  Loader2,
  MoreHorizontal,
  Package,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function SellerOrdersContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { sellerOrders, loading } = useSelector(
    (state: RootState) => state.orders
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    if (user && token) {
      fetchSellerOrders();
    }
  }, [user, token]);

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
        console.log("Fetched seller orders:", data.data);
        dispatch(setSellerOrders(data.data.orders || []));
      } else {
        throw new Error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching seller orders:", error);
      dispatch(setError("Failed to load orders"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const filteredOrders = sellerOrders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order?.buyerId?.username || "guest")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (order?.buyerId?.email || "guest@example.com")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.subOrder.status === statusFilter;
    return matchesSearch && matchesStatus;
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

  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: string
  ) => {
    setUpdatingOrder(orderId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/update/${orderId}`,
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
        dispatch(updateOrderStatus({ orderId, status: newStatus as any }));
        await fetchSellerOrders(); // Refresh orders after update
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Network error. Please try again.");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const viewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };

  const orderStats = {
    total: sellerOrders.length,
    pending: sellerOrders.filter((o) => o.status === "PENDING").length,
    confirmed: sellerOrders.filter((o) => o.status === "CONFIRMED").length,
    delivered: sellerOrders.filter((o) => o.status === "DELIVERED").length,
    completed: sellerOrders.filter((o) => o.status === "COMPLETED").length,
    cancelled: sellerOrders.filter((o) => o.status === "CANCELLED").length,
  };

  const subtotal = sellerOrders.reduce(
    (sum, order) => sum + order.subOrder.subtotal,
    0
  );

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order Management
            </h1>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {orderStats.total}
                </p>
                <p className="text-sm text-gray-600">Total Orders</p>
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
                <p className="text-2xl font-bold text-purple-600">
                  {orderStats.delivered}
                </p>
                <p className="text-sm text-gray-600">Delivered</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {orderStats.completed}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
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
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search orders, customers, or emails..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
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
              Manage your customer orders and track their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-500">Loading orders...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">
                        {order._id?.slice(-8)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {order.buyerId.username
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {order.buyerId.username}
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.buyerId.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {order.subOrder.items?.map((item) => (
                            <Image
                              key={item._id}
                              src={
                                item.productId.imageUrl || "/placeholder.svg"
                              }
                              alt={item.productId.name}
                              width={30}
                              height={30}
                              className="rounded object-cover"
                            />
                          ))}
                          {order.subOrder.items.length > 2 && (
                            <span className="text-sm text-gray-500">
                              +{order.subOrder.items.length - 2}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        Rs. {order.subOrder.subtotal?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusColor(order.subOrder.status)}
                        >
                          {order.subOrder.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-between">
                          <Badge
                            className={getPaymentStatusColor(
                              order?.payment?.status || "UNPAID"
                            )}
                          >
                            {order?.payment?.status || "UNPAID"}
                          </Badge>

                          {/* <DropdownMenu>
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
                          </DropdownMenu> */}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt)?.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              disabled={updatingOrder === order._id}
                            >
                              {updatingOrder === order._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => viewOrderDetails(order)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {order.subOrder.status === "PENDING" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateOrderStatus(
                                    order._id,
                                    "CONFIRMED"
                                  )
                                }
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Confirm Order
                              </DropdownMenuItem>
                            )}
                            {order.subOrder.status === "CONFIRMED" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateOrderStatus(
                                    order._id,
                                    "DELIVERED"
                                  )
                                }
                              >
                                <Truck className="mr-2 h-4 w-4" />
                                Mark as Delivered
                              </DropdownMenuItem>
                            )}
                            {order.subOrder.status === "DELIVERED" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateOrderStatus(
                                    order._id,
                                    "COMPLETED"
                                  )
                                }
                              >
                                <Package className="mr-2 h-4 w-4" />
                                Mark as Completed
                              </DropdownMenuItem>
                            )}
                            {(order.subOrder.status === "PENDING" ||
                              order.subOrder.status === "CONFIRMED") && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateOrderStatus(
                                    order._id,
                                    "CANCELLED"
                                  )
                                }
                                className="text-red-600"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel Order
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {!loading && filteredOrders.length === 0 && (
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
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Order Details - {selectedOrder?._id?.slice(-8)}
              </DialogTitle>
              <DialogDescription>
                Complete information about this order
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                {/* Order Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
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
                </div>

                {/* Customer Info */}
                <div>
                  <h4 className="font-semibold mb-3">Customer Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {selectedOrder.buyerId.username
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("")}
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

                {/* Products */}
                <div>
                  <h4 className="font-semibold mb-3">Products Ordered</h4>
                  <div className="space-y-3">
                    {selectedOrder.subOrder.items.map((item: any) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Image
                            src={item.productId.imageUrl || "/placeholder.svg"}
                            alt={item.productId.name}
                            width={60}
                            height={60}
                            className="rounded object-cover"
                          />
                          <div>
                            <p className="font-medium">{item.productId.name}</p>
                            <p className="text-sm text-gray-500">
                              Quantity: {item.quantity}
                            </p>
                            <p className="text-sm text-gray-500">
                              Unit Price: Rs. {item.price}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold">
                          Rs. {(item.price * item.quantity)?.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h4 className="font-semibold mb-3">Shipping Address</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p>{selectedOrder.shippingInfo.name}</p>
                    <p>{selectedOrder.shippingInfo.address}</p>
                    <p>{selectedOrder.shippingInfo.city}</p>
                    <p>Phone: {selectedOrder.shippingInfo.phone}</p>
                  </div>
                </div>

                {/* Payment & Order Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-3">Payment Information</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p>
                        <strong>Method:</strong> {selectedOrder.payment.method}
                      </p>
                      <p>
                        <strong>Status:</strong> {selectedOrder.payment.status}
                      </p>
                      <p>
                        <strong>Amount:</strong> Rs.
                        {selectedOrder.subOrder.subtotal?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Order Information</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p>
                        <strong>Order Date:</strong>{" "}
                        {new Date(
                          selectedOrder.createdAt
                        )?.toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Last Updated:</strong>{" "}
                        {new Date(
                          selectedOrder.updatedAt
                        )?.toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Total:</strong> Rs.
                        {selectedOrder.total?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsOrderDetailOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function SellerOrdersPage() {
  return (
    <RouteGuard allowedRoles={["seller"]}>
      <SellerOrdersContent />
    </RouteGuard>
  );
}
