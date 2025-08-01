import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface OrderItem {
  _id: string
  productId: {
    _id: string
    name: string
    price: number
    imageUrl: string
  }
  quantity: number
  price: number
  sellerId: {
    _id: string
    username: string
  }
}

interface Order {
  _id: string
  buyerId: {
    _id: string
    username: string
    email: string
  }
  sellerId?: {
    _id: string
    username: string
    email: string
  }
  orderItems: OrderItem[]
  total: number
  status: "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED" | "COMPLETED"
  payment: {
    _id: string
    amount: number
    method: "COD" | "ESEWA" | "KHALTI"
    status: "UNPAID" | "PAID"
    transaction_uuid?: string
  }
  shippingInfo: {
    name?: string
    address?: string
    city?: string
    phone?: string
  }
  createdAt: string
  updatedAt: string
}

interface OrderState {
  orders: Order[]
  sellerOrders: Order[]
  currentOrder: Order | null
  loading: boolean
  error: string | null
}

const initialState: OrderState = {
  orders: [],
  sellerOrders: [],
  currentOrder: null,
  loading: false,
  error: null,
}

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload
    },
    setSellerOrders: (state, action: PayloadAction<Order[]>) => {
      state.sellerOrders = action.payload
    },
    setCurrentOrder: (state, action: PayloadAction<Order>) => {
      state.currentOrder = action.payload
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload)
    },
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: Order["status"] }>) => {
      // Update in seller orders
      const sellerOrder = state.sellerOrders.find((order) => order._id === action.payload.orderId)
      if (sellerOrder) {
        sellerOrder.status = action.payload.status
        sellerOrder.updatedAt = new Date().toISOString()
      }

      // Update in all orders
      const order = state.orders.find((order) => order._id === action.payload.orderId)
      if (order) {
        order.status = action.payload.status
        order.updatedAt = new Date().toISOString()
      }

      // Update current order if it matches
      if (state.currentOrder && state.currentOrder._id === action.payload.orderId) {
        state.currentOrder.status = action.payload.status
        state.currentOrder.updatedAt = new Date().toISOString()
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setOrders, setSellerOrders, setCurrentOrder, addOrder, updateOrderStatus, setLoading, setError } =
  orderSlice.actions
export default orderSlice.reducer
