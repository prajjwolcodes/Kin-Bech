import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface OrderItem {
  _id: string
  productId: {
    _id: string
    name: string
    price: number
    imageUrl?: string
  }
  quantity: number
  price: number
  sellerId: string // backend returns just sellerId, not object
  createdAt: string
  updatedAt: string
}

interface Order {
  _id: string
  buyerId: {
    _id?: string
    username?: string
    email?: string
  }
  total: number
  status: "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED" | "COMPLETED"
  subOrder: {
    sellerId: string
    items: OrderItem[]
    subtotal: number
    status: "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED" | "COMPLETED"
  }
  payment: {
    method: "ESEWA" | "KHALTI" | "COD"
    status: string // optional, only for ESEWA and KHALTI
  } // "ESEWA" | "KHALTI" | "COD"
  shippingInfo?: {
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
    updateOrderStatus: (
      state,
      action: PayloadAction<{ orderId: string; status: Order["status"] }>
    ) => {
      const { orderId, status } = action.payload

      const update = (o?: Order) => {
        if (o) {
          o.status = status
          o.updatedAt = new Date().toISOString()
        }
      }

      update(state.sellerOrders.find((o) => o._id === orderId))
      update(state.orders.find((o) => o._id === orderId))
      if (state.currentOrder && state.currentOrder._id === orderId) {
        update(state.currentOrder)
      }
    },

    updatePaymentStatus: (
      state,
      action: PayloadAction<{ orderId: string; status: Order["payment"]["status"] }>
    ) => {
      const { orderId, status } = action.payload

      const update = (o?: Order) => {
        if (o) {
          o.payment.status = status
          o.updatedAt = new Date().toISOString()
        }
      }

      update(state.sellerOrders.find((o) => o._id === orderId))
      update(state.orders.find((o) => o._id === orderId))
      if (state.currentOrder && state.currentOrder._id === orderId) {
        update(state.currentOrder)
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

export const {
  setOrders,
  setSellerOrders,
  setCurrentOrder,
  addOrder,
  updateOrderStatus,
  updatePaymentStatus,
  setLoading,
  setError,
} = orderSlice.actions

export default orderSlice.reducer
