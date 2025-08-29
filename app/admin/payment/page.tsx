"use client";

import React, { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MoreVertical } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

interface Seller {
  _id: string;
  username: string;
  email: string;
  totalOrders: number;
  completedOrders: number;
  payableAmount: number;
  totalRevenue: number;
  commission: number;
}

const AdminSellerStatsPage = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const { user, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    async function fetchSellers() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/seller`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        setSellers(data.sellers);
      } catch (err) {
        console.error("Failed to fetch sellers", err);
      }
    }
    fetchSellers();
  }, [token]);

  const totalRevenue = sellers.reduce((sum, s) => sum + s.totalRevenue, 0);
  const totalCommission = sellers.reduce((sum, s) => sum + s.commission, 0);
  const totalPayable = sellers.reduce((sum, s) => sum + s.payableAmount, 0);

  async function paySeller(sellerId: string) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/checkout/paytoseller/${sellerId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to pay seller");
      }

      const data = await res.json();
      console.log("Payment successful:", data);

      // Update the seller's payableAmount in state
      setSellers((prevSellers) =>
        prevSellers.map((seller) =>
          seller._id === sellerId ? { ...seller, payableAmount: 0 } : seller
        )
      );
    } catch (err) {
      console.error("Failed to pay seller", err);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Seller Statistics</h2>

      {/* Summary Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 shadow-md rounded-xl p-4 border">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-xl font-bold">Rs. {totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 shadow-md rounded-xl p-4 border">
          <p className="text-sm text-muted-foreground">
            Total Commission Earned
          </p>
          <p className="text-xl font-bold">Rs. {totalCommission.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 shadow-md rounded-xl p-4 border">
          <p className="text-sm text-muted-foreground">Total Payable Amount</p>
          <p className="text-xl font-bold">Rs. {totalPayable.toFixed(2)}</p>
        </div>
      </div>

      {/* Seller Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Total Orders</TableHead>
            <TableHead>Completed Orders</TableHead>
            <TableHead>Revenue</TableHead>
            <TableHead>Commission</TableHead>
            <TableHead>Payable Amount</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sellers.map((seller) => (
            <TableRow key={seller._id}>
              <TableCell>{seller.username}</TableCell>
              <TableCell>{seller.email}</TableCell>
              <TableCell>{seller.totalOrders}</TableCell>
              <TableCell>{seller.completedOrders}</TableCell>
              <TableCell>
                Rs.{" "}
                {seller.completedOrders
                  ? seller.totalRevenue.toFixed(2)
                  : "0.00"}
              </TableCell>
              <TableCell>Rs. {seller.commission.toFixed(2)}</TableCell>
              <TableCell>Rs. {seller.payableAmount.toFixed(2)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <Dialog
                      open={!!selectedSeller}
                      onOpenChange={() => setSelectedSeller(null)}
                    >
                      <DialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={() => setSelectedSeller(seller)}
                        >
                          View Details
                        </DropdownMenuItem>
                      </DialogTrigger>
                      {seller.payableAmount > 0 && (
                        <DropdownMenuItem onClick={() => paySeller(seller._id)}>
                          Pay Now
                        </DropdownMenuItem>
                      )}
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Seller Details</DialogTitle>
                        </DialogHeader>
                        {selectedSeller && (
                          <div className="space-y-2">
                            <p>
                              <strong>Username:</strong>{" "}
                              {selectedSeller.username}
                            </p>
                            <p>
                              <strong>Email:</strong> {selectedSeller.email}
                            </p>
                            <p>
                              <strong>Total Orders:</strong>{" "}
                              {selectedSeller.totalOrders}
                            </p>
                            <p>
                              <strong>Completed Orders:</strong>{" "}
                              {selectedSeller.completedOrders}
                            </p>
                            <p>
                              <strong>Revenue:</strong> Rs.{" "}
                              {selectedSeller.totalRevenue.toFixed(2)}
                            </p>
                            <p>
                              <strong>Commission:</strong> Rs.{" "}
                              {selectedSeller.commission.toFixed(2)}
                            </p>
                            <p>
                              <strong>Payable Amount:</strong> Rs.{" "}
                              {selectedSeller.payableAmount.toFixed(2)}
                            </p>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminSellerStatsPage;
