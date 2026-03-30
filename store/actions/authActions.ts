import { createAsyncThunk } from "@reduxjs/toolkit";
import { clearError } from "@/store/slices/authSlice";

export { clearError };

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  companyName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  tenantId?: string;
  roles?: string[];
}

export interface AuthResponse {
  status?: boolean;
  message?: string;
  data?: User & { token: string };
}

export const signup = createAsyncThunk<AuthResponse, SignupPayload>(
  "auth/signup",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Signup failed");
      }

      return data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const login = createAsyncThunk<AuthResponse, LoginPayload>(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Login failed");
      }

      // Store token in localStorage
      if (data.data?.token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("token", data.data.token);
          localStorage.setItem("user", JSON.stringify({
            id: data.data.id,
            name: data.data.name,
            email: data.data.email,
            phone: data.data.phone,
            tenantId: data.data.tenantId,
            roles: data.data.roles,
          }));
        }
      }

      return data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};
