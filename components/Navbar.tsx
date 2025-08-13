"use client";

import { RootState } from "@/lib/store";
import Image from "next/image";
import logo from "@/public/logo.png";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Heart,
  LogOut,
  Menu,
  Search,
  Settings,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { Input } from "./ui/input";
import { Badge } from "@/components/ui/badge";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/features/auth/authSlice";
import { setSearchQuery } from "@/lib/features/products/productSlice";

const Navbar = () => {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { items: cartItems } = useSelector((state: RootState) => state.cart);
  const { searchQuery } = useSelector((state: RootState) => state.products);
  const dispatch = useDispatch();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const cartItemsCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  return (
    <nav className="border-b sticky bg-inherit top-0 z-50">
      <div className="container mx-auto px-4 py-5 flex items-center justify-between w-full">
        {/* Left - Logo */}
        <Link
          href={
            isAuthenticated
              ? user?.role === "buyer"
                ? "/buyer/dashboard"
                : user?.role === "seller"
                ? "/seller/dashboard"
                : user?.role === "admin"
                ? "/admin/dashboard"
                : "/"
              : "/"
          }
        >
          <div className="flex items-center space-x-2">
            <Image
              src={logo}
              alt="Kinbech Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              KinBech
            </span>
          </div>
        </Link>

        {/* Center - Desktop links */}
        <div className="hidden md:flex items-center justify-center space-x-12 flex-1">
          {(pathname === "/" || !isAuthenticated) && (
            <>
              <Link
                href="#features"
                className="text-gray-700 hover:text-gray-900"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-gray-700 hover:text-gray-900"
              >
                How it Works
              </Link>
              <Link
                href="#pricing"
                className="text-gray-700 hover:text-gray-900"
              >
                Pricing
              </Link>
            </>
          )}

          {isAuthenticated && pathname !== "/" && user?.role === "buyer" && (
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 w-full"
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              />
            </div>
          )}

          {isAuthenticated && pathname !== "/" && user?.role === "seller" && (
            <>
              <Link
                href="/seller/dashboard"
                className="text-gray-700 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                href="/seller/products"
                className="text-gray-700 hover:text-gray-900"
              >
                My Products
              </Link>
              <Link
                href="/seller/orders"
                className="text-gray-700 hover:text-gray-900"
              >
                Orders
              </Link>
              <Link
                href="/seller/analytics"
                className="text-gray-700 hover:text-gray-900"
              >
                Analytics
              </Link>
            </>
          )}

          {isAuthenticated && pathname !== "/" && user?.role === "admin" && (
            <>
              <Link href="/admin/dashboard" className="hover:text-indigo-600">
                Dashboard
              </Link>
              <Link href="/admin/orders" className="hover:text-indigo-600">
                All Orders
              </Link>
              <Link href="/admin/users" className="hover:text-indigo-600">
                All Users
              </Link>
              <Link href="/admin/payment" className="hover:text-indigo-600">
                To Pay
              </Link>
            </>
          )}
        </div>

        {/* Right - Buttons */}
        <div className="flex items-center space-x-3">
          <Link
            href={
              isAuthenticated
                ? user?.role === "buyer"
                  ? "/buyer/dashboard"
                  : user?.role === "seller"
                  ? "/seller/dashboard"
                  : user?.role === "admin"
                  ? "/admin/dashboard"
                  : "/auth/login"
                : "/auth/login"
            }
            className="hidden md:block"
          >
            {(pathname === "/" || !isAuthenticated) && (
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                Get Started
              </Button>
            )}
          </Link>

          {isAuthenticated && pathname !== "/" && user?.role === "buyer" && (
            <>
              {/* Cart */}
              <Link href="/buyer/cart">
                <Button
                  variant="outline"
                  size="sm"
                  className="relative bg-transparent"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {cartItemsCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {cartItemsCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
            </>
          )}

          {isAuthenticated && pathname !== "/" && (
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
                      {user?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                {user?.role === "buyer" && (
                  <DropdownMenuItem>
                    <Link
                      href="/buyer/orders"
                      className="flex items-center w-full"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <Heart className="mr-2 h-4 w-4" />
                  Wishlist
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white shadow-sm">
          <div className="flex flex-col p-4 space-y-3">
            {!isAuthenticated && (
              <>
                <Link href="#features">Features</Link>
                <Link href="#how-it-works">How it Works</Link>
                <Link href="#pricing">Pricing</Link>
                <Link href="/auth/signup">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                    Get Started
                  </Button>
                </Link>
              </>
            )}

            {isAuthenticated && pathname !== "/" && user?.role === "buyer" && (
              <>
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                />
                <Link href="/buyer/cart">Cart</Link>
                <Link href="/buyer/orders">My Orders</Link>
                <Link href="#">Wishlist</Link>
              </>
            )}

            {isAuthenticated && pathname !== "/" && user?.role === "seller" && (
              <>
                <Link href="#">My Products</Link>
                <Link href="#">Analytics</Link>
              </>
            )}

            {isAuthenticated && pathname !== "/" && user?.role === "admin" && (
              <>
                <Link href="#">Users</Link>
                <Link href="#">Settings</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
