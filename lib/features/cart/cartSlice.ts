import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface CartItem {
  _id: string
  name: string
  price: number
  imageUrl: string
  sellerId: string
  sellerName: string
  count: number
  quantity: number
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, "quantity">>) => {
      const existingItem = state.items.find((item) => item._id === action.payload._id)

      if (existingItem) {
        if (existingItem.quantity < action.payload.count) {
          existingItem.quantity += 1
        }
      } else {
        state.items.push({ ...action.payload, quantity: 1 })
      }

      // Recalculate totals
      state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item._id !== action.payload)
      state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
    },
    updateQuantity: (state, action: PayloadAction<{ _id: string; quantity: number }>) => {
      const item = state.items.find((item) => item._id === action.payload._id)
      if (item && action.payload.quantity <= item.count && action.payload.quantity > 0) {
        item.quantity = action.payload.quantity
      }
      state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
    },
    clearCart: (state) => {
      state.items = []
      state.total = 0
      state.itemCount = 0
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer
