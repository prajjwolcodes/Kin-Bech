import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface User {
  _id: string
  username: string
  email: string
  role: "buyer" | "seller" | "admin"
  createdAt: string
  updatedAt?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  token: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  token: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.loading = false
      // Store token and user in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload.token)
        localStorage.setItem("user", JSON.stringify(action.payload.user))
      }
    },
    loginFailure: (state) => {
      state.loading = false
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      // Remove token and user from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
    },
    initializeAuth: (state) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token")
        const userStr = localStorage.getItem("user")
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr)
            state.user = user
            state.token = token
            state.isAuthenticated = true
          } catch (error) {
            // Clear invalid data
            localStorage.removeItem("token")
            localStorage.removeItem("user")
          }
        }
      }
    },
  },
})

export const { loginStart, loginSuccess, loginFailure, logout, setCredentials, initializeAuth } = authSlice.actions
export default authSlice.reducer
