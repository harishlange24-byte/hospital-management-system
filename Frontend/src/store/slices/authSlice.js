import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as authApi from '../../api/auth.api'

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await authApi.getMe()
      return data.user
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await authApi.loginUser(credentials)
      return data.user
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await authApi.registerUser(payload)
      return data.user
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logoutUser()
      return null
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    initializing: true,
    error: null,
  },
  reducers: {
    clearAuthError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.initializing = true
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
        state.initializing = false
        state.error = null
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.initializing = false
      })
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.loading = false
        state.error = null
      })
  },
})

export const { clearAuthError } = authSlice.actions
export default authSlice.reducer
