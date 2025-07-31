import { configureStore } from "@reduxjs/toolkit"
import authSlice from "./features/auth/authSlice"
import cartSlice from "./features/cart/cartSlice"
import productSlice from "./features/products/productSlice"
import orderSlice from "./features/orders/orderSlice"

export const store = configureStore({
  reducer: {
    auth: authSlice,
    cart: cartSlice,
    products: productSlice,
    orders: orderSlice,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
