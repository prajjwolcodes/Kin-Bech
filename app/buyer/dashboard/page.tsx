"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/lib/store";
import {
  setProducts,
  setCategories,
  setSelectedCategory,
  setSearchQuery,
  setLoading,
  setError,
} from "@/lib/features/products/productSlice";
import { addToCart } from "@/lib/features/cart/cartSlice";
import { logout } from "@/lib/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ShoppingCart,
  Star,
  Filter,
  Grid3X3,
  List,
  Heart,
  User,
  Bell,
  Settings,
  LogOut,
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

// Mock data matching backend models
const mockCategories = [
  {
    _id: "1",
    name: "Electronics",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    _id: "2",
    name: "Clothing",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

const mockProducts = [
  {
    _id: "1",
    name: "Wireless Bluetooth Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 99.99,
    categoryId: mockCategories[0],
    count: 50,
    imageUrl: "/placeholder.svg?height=300&width=300&text=Headphones",
    sellerId: {
      _id: "seller1",
      username: "TechStore",
      email: "tech@store.com",
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    _id: "2",
    name: "Organic Cotton T-Shirt",
    description: "Comfortable and sustainable cotton t-shirt",
    price: 29.99,
    categoryId: mockCategories[1],
    count: 25,
    imageUrl: "/placeholder.svg?height=300&width=300&text=T-Shirt",
    sellerId: {
      _id: "seller2",
      username: "EcoFashion",
      email: "eco@fashion.com",
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    _id: "3",
    name: "Smart Fitness Watch",
    description: "Track your fitness goals with this advanced smartwatch",
    price: 199.99,
    categoryId: mockCategories[0],
    count: 15,
    imageUrl: "/placeholder.svg?height=300&width=300&text=Smartwatch",
    sellerId: {
      _id: "seller3",
      username: "FitTech",
      email: "fit@tech.com",
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

function BuyerDashboardContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const {
    filteredProducts,
    categories,
    selectedCategory,
    searchQuery,
    loading,
  } = useSelector((state: RootState) => state.products);
  const { items: cartItems } = useSelector((state: RootState) => state.cart);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const fetchProductsAndCategories = async () => {
    dispatch(setLoading(true));

    try {
      // Fetch categories
      const categoriesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/category`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Fetch products
      const productsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (categoriesResponse.ok && productsResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        const productsData = await productsResponse.json();

        dispatch(setCategories(categoriesData.categories));
        dispatch(setProducts(productsData.products));
      } else {
        throw new Error("Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      dispatch(setError("Failed to load products"));

      // Fallback to mock data
      dispatch(setCategories(mockCategories));
      dispatch(setProducts(mockProducts));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleAddToCart = (product: any) => {
    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        sellerId: product.sellerId._id,
        sellerName: product.sellerId.username,
        count: product.count,
      })
    );
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const cartItemsCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
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
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                KinBech
              </span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 w-full"
                  value={searchQuery}
                  onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
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

              {/* Notifications */}
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </Button>

              {/* User Menu */}
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
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.username}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      href="/buyer/orders"
                      className="flex items-center w-full"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Wishlist</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
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

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl font-bold mb-4">
                Welcome back, {user?.username}!
              </h1>
              <p className="text-xl mb-6">
                Discover amazing products from trusted sellers
              </p>
              <Button size="lg" variant="secondary">
                Explore Deals
              </Button>
            </div>
            <div className="text-center">
              <Image
                src="/placeholder.svg?height=300&width=400&text=Shopping+Banner"
                alt="Shopping Banner"
                width={400}
                height={300}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant={selectedCategory === "" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => dispatch(setSelectedCategory(""))}
                  >
                    All Products
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category._id}
                      variant={
                        selectedCategory === category._id ? "default" : "ghost"
                      }
                      className="w-full justify-start"
                      onClick={() =>
                        dispatch(setSelectedCategory(category._id))
                      }
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Special Offers */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Special Offers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-4 rounded-lg">
                    <h3 className="font-bold">Flash Sale!</h3>
                    <p className="text-sm">Up to 50% off electronics</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-4 rounded-lg">
                    <h3 className="font-bold">Free Shipping</h3>
                    <p className="text-sm">On orders over ₹500</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedCategory
                    ? categories.find((c) => c._id === selectedCategory)?.name
                    : "All Products"}
                  <span className="text-gray-500 text-lg ml-2">
                    ({filteredProducts.length} items)
                  </span>
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Products Grid */}
            <div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {filteredProducts.map((product) => (
                <Card
                  key={product._id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <div className={`${viewMode === "list" ? "flex" : ""}`}>
                    <div
                      className={`${
                        viewMode === "list" ? "w-48 flex-shrink-0" : ""
                      }`}
                    >
                      <Image
                        src={product.imageUrl || "/placeholder.svg"}
                        alt={product.name}
                        width={300}
                        height={300}
                        className={`w-full object-cover ${
                          viewMode === "list" ? "h-48" : "h-64"
                        } rounded-t-lg ${
                          viewMode === "list"
                            ? "rounded-l-lg rounded-tr-none"
                            : ""
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {product.name}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              by {product.sellerId.username}
                            </CardDescription>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">
                          {product.description}
                        </p>
                        <div>
                          {product.categoryId.name && (
                            <Badge className="mb-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                              {product.categoryId.name}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-bold text-blue-600">
                              ₹{product.price}
                            </span>
                            <p className="text-sm text-gray-500">
                              {product.count} in stock
                            </p>
                          </div>
                          <Button
                            onClick={() => handleAddToCart(product)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            disabled={product.count === 0}
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {product.count === 0
                              ? "Out of Stock"
                              : "Add to Cart"}
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No products found matching your criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BuyerDashboard() {
  return (
    <RouteGuard allowedRoles={["buyer"]}>
      <BuyerDashboardContent />
    </RouteGuard>
  );
}
