"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  Award,
  Check,
  DollarSign,
  Headphones,
  Shield,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import headphones from "@/public/headphones.png";
import smartwatch from "@/public/smartwatch.png";
import jacket from "@/public/jacket.png";
import Link from "next/link";

export default function KinBechLanding() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: any) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail("");
      }, 3000);
    }
  };

  const features = [
    {
      icon: Award,
      title: "Curated Selection",
      description:
        "Every product is handpicked by our experts to ensure premium quality and exceptional value.",
    },
    {
      icon: Truck,
      title: "Lightning Fast Delivery",
      description:
        "Get your orders delivered in record time with same-day and next-day delivery options.",
    },
    {
      icon: Shield,
      title: "Secure Shopping",
      description:
        "Shop with confidence using bank-level security and comprehensive buyer protection.",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description:
        "Our dedicated customer service team is always ready to help with any questions.",
    },
    {
      icon: DollarSign,
      title: "Best Prices",
      description:
        "Enjoy competitive pricing with regular discounts and exclusive member benefits.",
    },
    {
      icon: Sparkles,
      title: "Personalized Experience",
      description:
        "Discover products tailored to your preferences with AI-powered recommendations.",
    },
  ];

  const stats = [
    { number: "1M+", label: "Happy Customers" },
    { number: "50K+", label: "Products" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" },
  ];

  const featuredProducts = [
    {
      id: 1,
      name: "Wireless Headphones",
      description:
        "Experience the freedom of wireless audio with our top-rated headphones.",
      image: headphones,
      category: "Electronics",
      price: 599.99,
    },
    {
      id: 2,
      name: "Smartwatch",
      description:
        "Stay connected on the go with our stylish and functional smartwatches.",
      image: smartwatch,
      category: "Wearables",
      price: 1299.99,
    },
    {
      id: 3,
      name: "Jacket",
      description: "Stay warm and stylish with our premium quality jackets.",
      image: jacket,
      category: "Clothing",
      price: 2199.99,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section id="home" className="pt-20 lg:pt-32 pb-16 lg:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Hero Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-2 text-sm font-medium">
                  ✨ New Launch - Free Shipping on All Orders
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Shop Smarter,{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Live Better
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                  Discover an extraordinary shopping experience with KinBech.
                  From cutting-edge electronics to lifestyle essentials, we
                  bring you the world's finest products with unmatched quality
                  and service.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup" className="inline-block">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Start Shopping
                    <ShoppingBag className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/auth/signup" className="inline-block">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 font-semibold px-8 py-4 rounded-full transition-all duration-300"
                  >
                    Sell Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t border-gray-200">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 lg:p-12 border border-gray-200">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Featured Products
                    </h3>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Live
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {featuredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <div className="w-16 h-16 border-gray-200 border rounded-xl flex items-center justify-center">
                          <Image
                            src={product.image}
                            alt={`Product ${product.name}`}
                            width={64}
                            height={64}
                            className="rounded-xl"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-gray-600 text-sm">
                            {product.category}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            Rs. {product.price}
                          </div>
                          <div className="text-green-600 text-sm">In stock</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-full">
                    View All Products
                  </Button>
                </div>
              </div>

              {/* Background Elements */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-10 animate-pulse"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-10 animate-pulse delay-75"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-2">
              Why Choose Us
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900">
              Experience the{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Future
              </span>{" "}
              of Shopping
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover why millions of customers trust KinBech for their
              shopping needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-200 bg-white"
              >
                <CardHeader className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-28 bg-white border-t border-gray-200 mb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="flex justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-900" />
            </div>
            <h2 className="flex gap-3 items-center justify-center text-4xl font-bold text-gray-800">
              Ready to
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Buy or Sell?
              </span>
            </h2>
            <p className="text-lg text-gray-600">
              KinBech is the trusted marketplace for both buyers and sellers.
              Shop quality products or grow your business — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gray-800 text-white hover:bg-gray-700 font-semibold px-8 py-4 rounded-full transition-all duration-200"
              >
                Browse Products
                <ShoppingBag className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-gray-900 text-gray-900 hover:bg-gray-100 font-semibold px-8 py-4 rounded-full transition-all duration-200"
              >
                Start Selling
                <Users className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  KinBech
                </span>
              </div>
              <p className="text-gray-600">
                Your trusted partner for premium shopping experiences and
                exceptional customer service.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Quick Links</h3>
              <div className="space-y-2">
                {["Home", "Products", "About Us", "Contact"].map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="block text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Support</h3>
              <div className="space-y-2">
                {["Help Center", "Shipping Info", "Returns", "Size Guide"].map(
                  (link) => (
                    <a
                      key={link}
                      href="#"
                      className="block text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {link}
                    </a>
                  )
                )}
              </div>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Legal</h3>
              <div className="space-y-2">
                {[
                  "Privacy Policy",
                  "Terms of Service",
                  "Cookie Policy",
                  "Accessibility",
                ].map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="block text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-gray-600">
              © 2025 KinBech. All rights reserved. Made with ❤️ for amazing
              shoppers.
            </p>
            <div className="flex items-center space-x-6">
              <a
                href="#"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
