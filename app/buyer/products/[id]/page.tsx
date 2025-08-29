"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import type { RootState } from "@/lib/store";
import { addToCart } from "@/lib/features/cart/cartSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingCart,
  Star,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  MessageCircle,
  Plus,
  Minus,
  ArrowLeft,
  Store,
  Award,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { RouteGuard } from "@/components/auth/routeGuard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  categoryId: {
    _id: string;
    name: string;
  };
  count: number;
  imageUrl: string;
  sellerId: {
    _id: string;
    username: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Review {
  _id: string;
  userId: {
    username: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

// Mock data for demonstration
const mockReviews: Review[] = [
  {
    _id: "1",
    userId: { username: "John Doe", avatar: "/placeholder-user.jpg" },
    rating: 5,
    comment: "Excellent product! Exactly as described and fast delivery.",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    _id: "2",
    userId: { username: "Sarah Smith" },
    rating: 4,
    comment: "Good quality, but shipping took a bit longer than expected.",
    createdAt: "2024-01-10T14:20:00Z",
  },
  {
    _id: "3",
    userId: { username: "Mike Johnson" },
    rating: 5,
    comment: "Amazing value for money. Highly recommended!",
    createdAt: "2024-01-08T09:15:00Z",
  },
];

// Mock products data
const mockProducts: Product[] = [
  {
    _id: "1",
    name: "Wireless Bluetooth Headphones",
    description:
      "Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio quality. Perfect for music lovers and professionals who demand the best sound experience.",
    price: 99.99,
    categoryId: { _id: "1", name: "Electronics" },
    count: 50,
    imageUrl: "/placeholder.svg?height=500&width=500&text=Headphones",
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
    description:
      "Comfortable and sustainable cotton t-shirt made from 100% organic cotton. Perfect for everyday wear with a soft feel and durable construction.",
    price: 29.99,
    categoryId: { _id: "2", name: "Clothing" },
    count: 25,
    imageUrl: "/placeholder.svg?height=500&width=500&text=T-Shirt",
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
    description:
      "Track your fitness goals with this advanced smartwatch featuring heart rate monitoring, GPS tracking, and 7-day battery life.",
    price: 199.99,
    categoryId: { _id: "1", name: "Electronics" },
    count: 15,
    imageUrl: "/placeholder.svg?height=500&width=500&text=Smartwatch",
    sellerId: {
      _id: "seller3",
      username: "FitTech",
      email: "fit@tech.com",
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

function ProductDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);
  const { items: cartItems } = useSelector((state: RootState) => state.cart);

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id, token]);

  const fetchProduct = async (productId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Try to fetch from API first
      if (token) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/product/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setProduct(data.product);

          // Fetch related products
          if (data.product.categoryId._id) {
            fetchRelatedProducts(data.product.categoryId._id, productId);
          }
          setLoading(false);
          return;
        }
      }

      // Fallback to mock data
      const mockProduct = mockProducts.find((p) => p._id === productId);
      if (mockProduct) {
        setProduct(mockProduct);

        // Set related products from same category
        const related = mockProducts
          .filter(
            (p) =>
              p._id !== productId &&
              p.categoryId._id === mockProduct.categoryId._id
          )
          .slice(0, 4);
        setRelatedProducts(related);
      } else {
        throw new Error("Product not found");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (
    categoryId: string,
    currentProductId: string
  ) => {
    try {
      if (token) {
        const response = await fetch(
          `/api/products?category=${categoryId}&limit=4`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const filtered = data.products.filter(
            (p: Product) => p._id !== currentProductId
          );
          setRelatedProducts(filtered.slice(0, 4));
          return;
        }
      }

      // Fallback to mock data
      const related = mockProducts
        .filter(
          (p) => p._id !== currentProductId && p.categoryId._id === categoryId
        )
        .slice(0, 4);
      setRelatedProducts(related);
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
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
      }
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.count || 1)) {
      setQuantity(newQuantity);
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const ratingDistribution = getRatingDistribution();
  const cartItem = cartItems.find((item) => item._id === product._id);
  const cartQuantity = cartItem?.quantity || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white">
        <div className="container mx-auto px-4 pt-4">
          <div className="flex items-center justify-between space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="text-sm text-gray-500">
              <Link href="/buyer/dashboard" className="hover:text-blue-600">
                Home
              </Link>
              <span className="mx-2">/</span>
              <Link href="/buyer/dashboard" className="hover:text-blue-600">
                {product.categoryId.name}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900">{product.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-4 pb-8">
        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white w-full h-[600px] rounded-lg shadow-sm overflow-hidden">
              <Image
                src={product.imageUrl || "/placeholder.svg"}
                alt={product.name}
                width={400}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail images */}
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((_, index) => (
                <button
                  key={index}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index
                      ? "border-blue-600"
                      : "border-gray-200"
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <Image
                    src={product.imageUrl || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
            </div>

            {/* Price */}
            <div className="border-t border-b py-4">
              <div className="flex items-center space-x-4">
                <span className="text-4xl font-bold text-blue-600">
                  ₹{product.price}
                </span>
                <div className="text-sm text-gray-500">
                  <p>Inclusive of all taxes</p>
                  <p className="text-green-600">Free delivery available</p>
                </div>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {product.count > 0 ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">
                    In Stock ({product.count} available)
                  </span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-600 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Quantity Selector */}
            {product.count > 0 && (
              <div className="flex items-center space-x-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.count}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex w-full space-x-4">
                  <Button
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={handleAddToCart}
                    disabled={product.count === 0}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {product.count === 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons */}

            {/* Seller Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      <Store className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {product.sellerId.username}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <Award className="h-4 w-4 mr-1" />
                      <span>Verified Seller</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 text-sm">
                <Truck className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Free Delivery</p>
                  <p className="text-gray-600">2-3 days</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <RotateCcw className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Easy Returns</p>
                  <p className="text-gray-600">7 days</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Warranty</p>
                  <p className="text-gray-600">1 year</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Card className="mb-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="p-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>

                <h3 className="text-lg font-semibold mt-6 mb-3">
                  Key Features:
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Premium build quality with durable materials</li>
                  <li>Advanced technology for superior performance</li>
                  <li>User-friendly design for everyday use</li>
                  <li>Excellent value for money</li>
                  <li>Backed by manufacturer warranty</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

export default function ProductDetails() {
  return (
    <RouteGuard allowedRoles={["buyer"]}>
      <ProductDetailsContent />
    </RouteGuard>
  );
}
