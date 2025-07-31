import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface OrderItem {
  productId: {
    _id: string
    name: string
    price: number
    imageUrl: string
  }
  quantity: number
  price: number
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
  paymentMethod: "COD" | "ESEWA" | "KHALTI"
  shippingInfo: {
    address: string
    city: string
    postalCode: string
    country: string
    phone: string
  }
  createdAt: string
  updatedAt: string
}

interface OrderState {
  orders: Order[]
  currentOrder: Order | null
  loading: boolean
  error: string | null
}

const initialState: OrderState = {
  orders: [],
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
    setCurrentOrder: (state, action: PayloadAction<Order>) => {
      state.currentOrder = action.payload
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload)
    },
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: Order["status"] }>) => {
      const order = state.orders.find((order) => order._id === action.payload.orderId)
      if (order) {
        order.status = action.payload.status
      }
      if (state.currentOrder && state.currentOrder._id === action.payload.orderId) {
        state.currentOrder.status = action.payload.status
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

export const { setOrders, setCurrentOrder, addOrder, updateOrderStatus, setLoading, setError } = orderSlice.actions
export default orderSlice.reducer
