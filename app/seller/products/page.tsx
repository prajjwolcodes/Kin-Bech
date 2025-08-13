"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/lib/store";
import {
  setSellerProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  setCategories,
  setLoading,
  setError,
} from "@/lib/features/products/productSlice";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Package,
  ArrowLeft,
  Bell,
  Settings,
  LogOut,
  User,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Loader2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { RouteGuard } from "@/components/auth/routeGuard";
import { useRouter } from "next/navigation";

interface ProductFormData {
  name: string;
  description: string;
  categoryId: string;
  price: string;
  count: string;
  imageUrl: string;
}

function SellerProductsContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { sellerProducts, categories, loading } = useSelector(
    (state: RootState) => state.products
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [newProduct, setNewProduct] = useState<ProductFormData>({
    name: "",
    description: "",
    categoryId: "",
    price: "",
    count: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (user && token) {
      fetchSellerProducts();
      fetchCategories();
    }
  }, [user, token]);

  const fetchSellerProducts = async () => {
    dispatch(setLoading(true));
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product/seller`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response);
      if (!response.ok) {
        throw new Error("Failed to fetch seller products");
      }

      const data = await response.json();
      if (data.products.length === 0) {
        dispatch(setError("No products found for this seller"));
      } else {
        dispatch(setError(""));
      }
      dispatch(setSellerProducts(data.products || []));
    } catch (error) {
      console.error("Error fetching seller products:", error);
      dispatch(setError("Failed to load products"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/category`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        dispatch(setCategories(data.categories || []));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const filteredProducts = sellerProducts.filter((product) => {
    if (!product || !product.name) return false; // skip invalid products

    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      product.categoryId?._id === selectedCategory; // when it's populated

    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && product.count > 0) ||
      (selectedStatus === "out_of_stock" && product.count === 0);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (count: number) => {
    if (count === 0) return "bg-red-100 text-red-800";
    if (count < 10) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusText = (count: number) => {
    if (count === 0) return "Out of Stock";
    if (count < 10) return "Low Stock";
    return "Active";
  };

  const handleAddProduct = async () => {
    setFormError("");
    setFormLoading(true);

    try {
      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        categoryId: newProduct.categoryId,
        price: Number.parseFloat(newProduct.price),
        count: Number.parseInt(newProduct.count),
        imageUrl:
          newProduct.imageUrl ||
          "/placeholder.svg?height=200&width=200&text=Product",
        sellerId: user?._id,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const createdProduct = {
          ...data.product,
          categoryId: data.product.categoryId?._id
            ? data.product.categoryId // already populated
            : categories.find((c) => c._id === data.product.categoryId) || {
                _id: data.product.categoryId,
                name: data.product.name,
              },
        };

        dispatch(addProduct(createdProduct));
        resetForm();
        setIsAddProductOpen(false);
      } else {
        const errorData = await response.json();
        setFormError(errorData.message || "Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      setFormError("Network error. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    setFormError("");
    setFormLoading(true);

    try {
      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        categoryId: newProduct.categoryId,
        price: Number.parseFloat(newProduct.price),
        count: Number.parseInt(newProduct.count),
        imageUrl: newProduct.imageUrl,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product/update/${editingProduct._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        dispatch(updateProduct(data.product)); // ✅ populated product
        resetForm();
        setIsAddProductOpen(false);
      } else {
        const errorData = await response.json();
        setFormError(errorData.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      setFormError("Network error. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product/delete/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        dispatch(deleteProduct(productId));
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Network error. Please try again.");
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description,
      categoryId: product.categoryId._id,
      price: product.price.toString(),
      count: product.count.toString(),
      imageUrl: product.imageUrl,
    });
    setIsAddProductOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setNewProduct({
      name: "",
      description: "",
      categoryId: "",
      price: "",
      count: "",
      imageUrl: "",
    });
    setFormError("");
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const productStats = {
    total: sellerProducts.length,
    active: sellerProducts.filter((p) => p.count > 0).length,
    outOfStock: sellerProducts.filter((p) => p.count === 0).length,
    lowStock: sellerProducts.filter((p) => p.count > 0 && p.count < 10).length,
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Product Management
            </h1>
            <p className="text-gray-600">
              Manage your product inventory and listings
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Dialog
              open={isAddProductOpen}
              onOpenChange={(open) => {
                if (!open) {
                  resetForm(); // ensure reset happens when closing via X or overlay
                }
                setIsAddProductOpen(open);
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingProduct
                      ? "Update your product information"
                      : "Create a new product listing for your store"}
                  </DialogDescription>
                  {/* <DialogClose asChild>
                    <button
                      onClick={() => {
                        setIsAddProductOpen(false);
                        resetForm();
                      }}
                      className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background 
                   transition-opacity hover:opacity-100 focus:outline-none"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </DialogClose> */}
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {formError && (
                    <Alert variant="destructive">
                      <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                      placeholder="Enter product name"
                      disabled={formLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newProduct.description}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter product description"
                      rows={3}
                      disabled={formLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newProduct.categoryId}
                      onValueChange={(value) =>
                        setNewProduct({ ...newProduct, categoryId: value })
                      }
                      disabled={formLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="price">Price (Rs. )</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            price: e.target.value,
                          })
                        }
                        placeholder="0.00"
                        disabled={formLoading}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="count">Stock Quantity</Label>
                      <Input
                        id="count"
                        type="number"
                        value={newProduct.count}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            count: e.target.value,
                          })
                        }
                        placeholder="0"
                        disabled={formLoading}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="imageUrl">Product Image URL</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      value={newProduct.imageUrl}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          imageUrl: e.target.value,
                        })
                      }
                      placeholder="https://example.com/image.jpg"
                      disabled={formLoading}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddProductOpen(false);
                      resetForm();
                    }}
                    disabled={formLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={
                      editingProduct ? handleUpdateProduct : handleAddProduct
                    }
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingProduct ? "Updating..." : "Adding..."}
                      </>
                    ) : editingProduct ? (
                      "Update Product"
                    ) : (
                      "Add Product"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {productStats.total}
                </p>
                <p className="text-sm text-gray-600">Total Products</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {productStats.active}
                </p>
                <p className="text-sm text-gray-600">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {productStats.lowStock}
                </p>
                <p className="text-sm text-gray-600">Low Stock</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {productStats.outOfStock}
                </p>
                <p className="text-sm text-gray-600">Out of Stock</p>
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
                    placeholder="Search products..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Products ({filteredProducts.length})</CardTitle>
            <CardDescription>
              Manage your product listings and inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Image
                            src={product.imageUrl || "/placeholder.svg"}
                            alt={product.name}
                            width={60}
                            height={60}
                            className="rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-500">
                              Created:{" "}
                              {new Date(product.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.categoryId.name}</TableCell>
                      <TableCell className="font-semibold">
                        Rs. {product.price.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            product.count === 0
                              ? "text-red-600 font-medium"
                              : product.count < 10
                              ? "text-yellow-600 font-medium"
                              : ""
                          }
                        >
                          {product.count}
                        </span>
                      </TableCell>

                      <TableCell>
                        <Badge className={getStatusColor(product.count)}>
                          {getStatusText(product.count)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Product
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteProduct(product._id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">
                  No products found matching your criteria.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => setIsAddProductOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Product
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SellerProductsPage() {
  return (
    <RouteGuard allowedRoles={["seller"]}>
      <SellerProductsContent />
    </RouteGuard>
  );
}
