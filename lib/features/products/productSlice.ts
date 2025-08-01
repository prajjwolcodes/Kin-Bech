import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface Category {
  _id: string
  name: string
  createdAt: string
  updatedAt: string
}

interface Seller {
  _id: string
  username: string
  email: string
}

interface Product {
  _id: string
  name: string
  description: string
  price: number
  categoryId: Category
  count: number
  imageUrl: string
  sellerId: Seller
  createdAt: string
  updatedAt: string
  sales?: number
  revenue?: number
  rating?: number
  reviews?: number
}

interface ProductState {
  products: Product[]
  sellerProducts: Product[]
  filteredProducts: Product[]
  categories: Category[]
  selectedCategory: string
  searchQuery: string
  loading: boolean
  error: string | null
}

const initialState: ProductState = {
  products: [],
  sellerProducts: [],
  filteredProducts: [],
  categories: [],
  selectedCategory: "",
  searchQuery: "",
  loading: false,
  error: null,
}

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload
      state.filteredProducts = action.payload
    },
    setSellerProducts: (state, action: PayloadAction<Product[]>) => {
      state.sellerProducts = action.payload
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.sellerProducts.unshift(action.payload)
      state.products.unshift(action.payload)
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.sellerProducts.findIndex((p) => p._id === action.payload._id)
      if (index !== -1) {
        state.sellerProducts[index] = action.payload
      }
      const productIndex = state.products.findIndex((p) => p._id === action.payload._id)
      if (productIndex !== -1) {
        state.products[productIndex] = action.payload
      }
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.sellerProducts = state.sellerProducts.filter((p) => p._id !== action.payload)
      state.products = state.products.filter((p) => p._id !== action.payload)
    },
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload
      state.filteredProducts = state.products.filter((product) => {
        const matchesCategory = action.payload === "" || product.categoryId._id === action.payload
        const matchesSearch =
          product.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(state.searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
      })
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
      state.filteredProducts = state.products.filter((product) => {
        const matchesCategory = state.selectedCategory === "" || product.categoryId._id === state.selectedCategory
        const matchesSearch =
          product.name.toLowerCase().includes(action.payload.toLowerCase()) ||
          product.description.toLowerCase().includes(action.payload.toLowerCase())
        return matchesCategory && matchesSearch
      })
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setProducts,
  setSellerProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  setCategories,
  setSelectedCategory,
  setSearchQuery,
  setLoading,
  setError,
} = productSlice.actions
export default productSlice.reducer
