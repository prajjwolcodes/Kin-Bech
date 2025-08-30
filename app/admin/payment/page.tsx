"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface Seller {
  _id: string;
  seller: {
    username: string;
    email: string;
  };
  payableAmount: number;
  totalOrders: number;
}

const SellerPayoutsPage = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    async function fetchSellers() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/checkout/unpaid`,
          {
            headers: { Authorization: `Bearer ${token}` },
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

  async function paySeller(sellerId: string) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/checkout/paytoseller/${sellerId}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Payment failed");
      const data = await res.json();

      // Update UI
      setSellers((prev) => prev.filter((s) => s._id !== sellerId));
      console.log("Paid:", data);
    } catch (err) {
      console.error(err);
    }
  }

  const totalPayable = sellers?.reduce((sum, s) => sum + s.payableAmount, 0);

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Seller Payouts</h1>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-800">Total Sellers</p>
              <p className="text-2xl font-bold">{sellers?.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-800">Total Payable</p>
              <p className="text-2xl font-bold text-green-600">
                Rs. {totalPayable?.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Unpaid Sellers</CardTitle>
            <CardDescription>
              Sellers with unpaid completed orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total Orders</TableHead>
                  <TableHead>Payable Amount</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellers.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell>{s.seller.username}</TableCell>
                    <TableCell>{s.seller.email}</TableCell>
                    <TableCell>{s.totalOrders}</TableCell>
                    <TableCell>Rs. {s.payableAmount?.toFixed(2)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => paySeller(s._id)}>
                            Pay Now
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {sellers?.length === 0 && (
              <p className="text-center text-gray-800 py-6">
                No unpaid sellers found
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SellerPayoutsPage;
