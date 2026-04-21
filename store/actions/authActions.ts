import { createAsyncThunk } from "@reduxjs/toolkit";
import { clearError } from "@/store/slices/authSlice";

export { clearError };

// =============================================
// TYPES
// =============================================

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

// =============================================
// RBAC TYPES
// =============================================

export interface CurrentAccess {
  user: {
    id: string;
    email: string;
    tenantId: string;
    roleType: string;
  };
  roles: string[];
  permissions: string[];
  groupedPermissions: Record<string, string[]>;
}

export interface RoleSummary {
  id: string;
  name: string;
  type: string;
  description?: string;
  tenantId?: string;
  isActive?: boolean;
  rolePermissions?: RolePermission[];
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
  permission: PermissionItem;
}

export interface PermissionItem {
  id: string;
  module: string;
  action: string;
  name?: string;
  scope?: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface TenantUser {
  id: string;
  name: string;
  email: string;
  managerId?: string | null;
  department?: { id: string; name: string };
  designation?: { id: string; name: string };
  userRoles?: { role: { id: string; name: string } }[];
}

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const authHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// =============================================
// RBAC THUNKS
// =============================================

// GET /auth/my-access — current user's access token
export const fetchMyAccess = createAsyncThunk<CurrentAccess, void, { rejectValue: string }>(
  "auth/fetchMyAccess",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/role/my-access`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch access");
      return data.data;
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

// GET /role/list-all
export const fetchAllRoles = createAsyncThunk<RoleSummary[], void, { rejectValue: string }>(
  "auth/fetchAllRoles",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/role/list-all`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch roles");
      return data.data || data;
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

// GET /permissions
export const fetchAllPermissions = createAsyncThunk<PermissionItem[], void, { rejectValue: string }>(
  "auth/fetchAllPermissions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/perm/list`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch permissions");
      // Response shape: { data: { "PAYROLL": [...], "ATTENDANCE": [...] } } — flatten to flat array
      const grouped: Record<string, PermissionItem[]> = data.data;
      if (!grouped) return [];
      return Object.values(grouped).flat();
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

// POST /role/assign-permissions
export const assignPermissionsToRole = createAsyncThunk<
  { roleId: string; permissionIds: string[] },
  { roleId: string; permissionIds: string[] },
  { rejectValue: string }
>(
  "auth/assignPermissionsToRole",
  async ({ roleId, permissionIds }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/role/assign-permissions`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ roleId, permissionIds }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to assign permissions");
      return { roleId, permissionIds };
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

// POST /role/assign-role
export const assignRoleToUser = createAsyncThunk<
  { userId: string; roleId: string },
  { userId: string; roleId: string },
  { rejectValue: string }
>(
  "auth/assignRoleToUser",
  async ({ userId, roleId }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/role/assign-role`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ userId, roleId }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to assign role");
      return { userId, roleId };
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

// POST /org/roles — create a new role
export const createRole = createAsyncThunk<RoleSummary, { name: string }, { rejectValue: string }>(
  "auth/createRole",
  async ({ name }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/role/create`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to create role");
      return data.data || data;
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

// DELETE /role/unassign-role
export const unassignRoleFromUser = createAsyncThunk<
  { userId: string; roleId: string },
  { userId: string; roleId: string },
  { rejectValue: string }
>(
  "auth/unassignRoleFromUser",
  async ({ userId, roleId }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/role/unassign-role`, {
        method: "DELETE",
        headers: authHeaders(),
        body: JSON.stringify({ userId, roleId }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to unassign role");
      return { userId, roleId };
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

// POST /role/transfer-role
export const transferRole = createAsyncThunk<
  { fromUserId: string; toUserId: string; roleId: string },
  { fromUserId: string; toUserId: string; roleId: string },
  { rejectValue: string }
>(
  "auth/transferRole",
  async ({ fromUserId, toUserId, roleId }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/role/transfer-role`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ fromUserId, toUserId, roleId }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to transfer role");
      return { fromUserId, toUserId, roleId };
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

// GET /org/users/select-options
export const fetchUserSelectOptions = createAsyncThunk<SelectOption[], void, { rejectValue: string }>(
  "auth/fetchUserSelectOptions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/users/select-options`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch users");
      // Response: TenantUser[] — map to SelectOption[]
      const users: TenantUser[] = data.data || [];
      return users.map((u) => ({ label: u.name || u.email, value: u.id }));
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

// ── Role Assigned Users ───────────────────────────────────────────────────────

export interface AssignedUser {
  userId: string;
  userName: string;
  userEmail: string;
  assignedAt?: string;
}

export interface RoleAssignedUsers {
  roleId: string;
  roleName: string;
  roleType: string;
  totalAssigned: number;
  assignedUsers: AssignedUser[];
}

export const fetchAssignedUsers = createAsyncThunk<RoleAssignedUsers[], void, { rejectValue: string }>(
  "auth/fetchAssignedUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/role/assigned-users`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch assigned users");
      return data.data || [];
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

// =============================================
// LEGACY AUTH THUNKS
// =============================================

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
