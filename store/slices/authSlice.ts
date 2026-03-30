import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { login, signup, User } from "../actions/authActions";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Helper to get initial state from localStorage
const getInitialState = (): AuthState => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        return {
          user,
          token,
          loading: false,
          error: null,
        };
      } catch {
        return {
          user: null,
          token: null,
          loading: false,
          error: null,
        };
      }
    }
  }
  return {
    user: null,
    token: null,
    loading: false,
    error: null,
  };
};

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Signup
    builder.addCase(signup.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signup.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      if (action.payload.data) {
        state.user = {
          id: action.payload.data.id,
          name: action.payload.data.name,
          email: action.payload.data.email,
          phone: action.payload.data.phone,
          tenantId: action.payload.data.tenantId,
          roles: action.payload.data.roles,
        };
        state.token = action.payload.data.token || null;
      }
    });
    builder.addCase(signup.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      if (action.payload.data) {
        state.user = {
          id: action.payload.data.id,
          name: action.payload.data.name,
          email: action.payload.data.email,
          phone: action.payload.data.phone,
          tenantId: action.payload.data.tenantId,
          roles: action.payload.data.roles,
        };
        state.token = action.payload.data.token || null;
      }
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
