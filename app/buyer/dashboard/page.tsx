"use client";

import { RouteGuard } from "@/components/auth/routeGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { addToCart } from "@/lib/features/cart/cartSlice";
import {
  setCategories,
  setError,
  setLoading,
  setProducts,
  setSelectedCategory,
} from "@/lib/features/products/productSlice";
import type { RootState } from "@/lib/store";
import { Filter, Grid3X3, Heart, List, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import bgImage from "@/public/bgimage.png";

// Mock data fallback
const mockCategories = [
  { _id: "1", name: "Electronics", createdAt: "", updatedAt: "" },
  { _id: "2", name: "Clothing", createdAt: "", updatedAt: "" },
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
    createdAt: "",
    updatedAt: "",
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
    createdAt: "",
    updatedAt: "",
  },
];

function BuyerDashboardContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { filteredProducts, categories, selectedCategory, loading } =
    useSelector((state: RootState) => state.products);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const fetchProductsAndCategories = async () => {
    dispatch(setLoading(true));
    try {
      const categoriesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/category`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const productsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (categoriesResponse.ok && productsResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        const productsData = await productsResponse.json();
        dispatch(setCategories(categoriesData.categories));
        dispatch(setProducts(productsData.products));
      } else throw new Error("Failed to fetch data");
    } catch (error) {
      console.error("Error fetching:", error);
      dispatch(setError("Failed to load products"));
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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] w-full bg-gray-50">
      {/* Modern Hero Banner */}
      {/* Hero Banner */}
      <section className="container mx-auto mt-4 mb-8 relative w-full h-[70vh] flex items-center justify-center overflow-hidden rounded-2xl ">
        {/* Background Image (your PNG goes here) */}
        <Image
          src={bgImage}
          alt="Hero Banner"
          fill
          className="object-cover"
          priority
        />

        {/* Overlay for readability */}
        <div className="absolute inset-0 px-6 py-4 bg-gradient-to-r from-black/20 via-black/10 to-transparent" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 text-left text-white max-w-3xl">
          <h1 className="text-5xl font-extrabold leading-tight mb-4 text-gray-800 drop-shadow-lg">
            Shop Smarter, Live Better
          </h1>
          <p className="text-lg md:text-xl text-black mb-6 opacity-90">
            Discover exclusive deals and trending products curated just for you.
          </p>
          <div className="flex gap-4">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6"
            >
              Start Shopping
            </Button>
            <Button size="lg" variant="secondary" className="rounded-full px-6">
              View Offers
            </Button>
          </div>
        </div>
      </section>

      {/* Layout with sidebar + products */}
      <div className="container mx-auto px-4 py-2 w-full flex gap-8">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="w-96 flex-shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-5 w-5" /> Categories
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
                    onClick={() => dispatch(setSelectedCategory(category._id))}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Special Offers */}
          {/* <Card className="mt-6">
            <CardHeader>
              <CardTitle>Special Offers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-4 rounded-lg">
                <h3 className="font-bold">Flash Sale!</h3>
                <p className="text-sm">Up to 50% off electronics</p>
              </div>
              <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-4 rounded-lg">
                <h3 className="font-bold">Free Shipping</h3>
                <p className="text-sm">On orders over Rs. 500</p>
              </div>
            </CardContent>
          </Card> */}
        </motion.aside>

        {/* Products */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {selectedCategory
                ? categories.find((c) => c._id === selectedCategory)?.name
                : "All Products"}{" "}
              <span className="text-gray-500 text-lg ml-2">
                ({filteredProducts.length} items)
              </span>
            </h2>
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

          <motion.div
            layout
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                : "grid-cols-1"
            }`}
          >
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <div className={`${viewMode === "list" ? "flex" : ""}`}>
                    <Link href={`/buyer/products/${product._id}`}>
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
                    </Link>
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
                        {product.categoryId?.name && (
                          <Badge className="mb-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            {product.categoryId.name}
                          </Badge>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-bold text-blue-600">
                              Rs. {product.price}
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
              </motion.div>
            ))}
          </motion.div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No products found matching your criteria.
              </p>
            </div>
          )}
        </main>
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
