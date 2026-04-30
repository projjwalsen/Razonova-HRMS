import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const authHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// =============================================
// TYPES
// =============================================

export interface DashboardKPIs {
  totalCompanies: number;
  totalUsers: number;
  activeUsers: number;
  pendingCompanies: number;
}

export interface CompanyDashboardKPIs {
  totalEmployees?: number;
  totalDepartments?: number;
  attendanceToday?: {
    present: number;
    absent: number;
    onLeave: number;
  };
  pendingApprovals?: {
    leaves: number;
    regularization: number;
    resignation: number;
    total: number;
  };
}

export interface Organization {
  id: string;
  tenantName?: string;
  companyName: string;
  logoUrl?: string | null;
  industry?: string | null;
  companySize?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  status: string;
  isActive: boolean;
  createdAt: string;
  companyAdmin?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  subscription?: {
    id: string;
    startDate: string;
    endDate: string | null;
  } | null;
  departmentsCount?: number;
  usersCount?: number;
}

export interface PendingApproval {
  id: string;
  name: string;
  type: string;
  requested: string;
  status: string;
}

export interface OrgUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt?: string;
  department?: {
    id: string;
    name: string;
  } | null;
  designations?: {
    id: string;
    name: string;
  } | null;
  roles: {
    id: string;
    name: string;
    type: string;
  }[];
}

export interface OrgCompany {
  id: string;
  tenantName: string;
  companyName: string;
  logoUrl?: string | null;
  industry?: string | null;
  status: string;
  isActive: boolean;
  totalUsers: number;
}

export interface OrgUsersResponse {
  company: OrgCompany;
  users: OrgUser[];
}

export interface FetchUsersParams {
  type?: 'admins' | 'employees' | 'all';
  status?: string;
  search?: string;
}

// =============================================
// SUBSCRIPTION MODULE TYPES
// =============================================

export interface SubscriptionModule {
  key: string;
  name: string;
  description?: string;
  isActive: boolean;
  monthlyPrice: number;
  yearlyPrice: number;
}

export interface CreateModulePayload {
  key: string;
  name: string;
  description?: string;
  isActive?: boolean;
  monthlyPrice?: number;
  yearlyPrice?: number;
}

export interface AssignModulesPayload {
  tenantId: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  startDate: string;
  endDate: string;
  modules: {
    moduleKey: string;
    isEnabled: boolean;
  }[];
}

export interface ActiveSubscription {
  hasSubscriptions: boolean;
  status: string;
  message: string;
  subscription: {
    id: string;
    tenantId: string;
    billingCycle: string;
    startDate: string;
    endDate?: string;
    isActive: boolean;
    cancelledAt?: string | null;
    createdAt: string;
    updatedAt: string;
    modules: SubscriptionModuleItem[];
  };
  modules: SubscriptionModuleItem[];
}

export interface SubscriptionModuleItem {
  id: string;
  subscriptionId: string;
  moduleId: string;
  isEnabled: boolean;
  monthlyPrice: number;
  yearlyPrice: number;
  createdAt: string;
  updatedAt: string;
  module: {
    id: string;
    key: string;
    name: string;
    description?: string;
    isActive: boolean;
    monthlyPrice: number;
    yearlyPrice: number;
  };
}

export interface SubscribedTenant {
  subscriptionId: string;
  tenantId: string;
  tenantName: string;
  companyName: string;
  billingCycle: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  totalModules: number;
  enabledModules: number;
}

// =============================================
// DASHBOARD KPIs
// GET /platform/dashboard/kpis — platform-level KPIs (for admin dashboard)
// =============================================

export const fetchDashboardKPIs = createAsyncThunk<DashboardKPIs, void, { rejectValue: string }>(
  "admin/fetchDashboardKPIs",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/platform/dashboard/kpis`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch dashboard KPIs");
      return data.data;
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

// =============================================
// COMPANY DASHBOARD KPIs
// GET /org/dashboard/kpis — company-level KPIs (for company dashboard)
// =============================================

export const fetchCompanyDashboardKPIs = createAsyncThunk<CompanyDashboardKPIs, void, { rejectValue: string }>(
  "admin/fetchCompanyDashboardKPIs",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/dashboard/kpis`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch company dashboard KPIs");
      return data.data;
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

// =============================================
// GET /platform/organizations
// =============================================

export const fetchOrganizations = createAsyncThunk<Organization[], void, { rejectValue: string }>(
  "admin/fetchOrganizations",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/platform/organizations`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch organizations");
      return data.data || [];
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

// =============================================
// GET /platform/organizations?status=PENDING
// =============================================

export const fetchPendingOrganizations = createAsyncThunk<Organization[], void, { rejectValue: string }>(
  "admin/fetchPendingOrganizations",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/platform/organizations?status=PENDING`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch pending organizations");
      return data.data || [];
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

// =============================================
// POST /platform/tenant/approve/{tenantId}
// =============================================

export const approveOrganization = createAsyncThunk<string, string, { rejectValue: string }>(
  "admin/approveOrganization",
  async (tenantId, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/platform/tenant/approve/${tenantId}`, {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to approve organization");
      return tenantId;
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

// =============================================
// POST /platform/tenant/reject/{tenantId}
// =============================================

export const rejectOrganization = createAsyncThunk<string, string, { rejectValue: string }>(
  "admin/rejectOrganization",
  async (tenantId, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/platform/tenant/reject/${tenantId}`, {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to reject organization");
      return tenantId;
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

// =============================================
// GET /platform/organizations/users
// Platform admin API to list users from all non-system companies, grouped company-wise.
// Parameters:
//   - type: 'admins' | 'employees' | 'all' (filter by role type)
//   - status: filter companies by tenant approval status
//   - search: search users by name, email, or phone
// =============================================

export const fetchPlatformUsers = createAsyncThunk<OrgUsersResponse[], FetchUsersParams, { rejectValue: string }>(
  "admin/fetchPlatformUsers",
  async (params, { rejectWithValue }) => {
    try {
      const searchParams = new URLSearchParams();
      if (params.type && params.type !== 'all') searchParams.set('type', params.type);
      if (params.status) searchParams.set('status', params.status);
      if (params.search) searchParams.set('search', params.search);

      const queryString = searchParams.toString();
      const url = `${BASE}/platform/organizations/users${queryString ? `?${queryString}` : ''}`;

      const res = await fetch(url, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch users");
      return data.data || [];
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

// =============================================
// GET /platform/subscription/modules
// Get all subscription modules
// =============================================

export const fetchSubscriptionModules = createAsyncThunk<SubscriptionModule[], void, { rejectValue: string }>(
  "admin/fetchSubscriptionModules",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/platform/subscription/modules`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch subscription modules");
      return data.data || [];
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

// =============================================
// POST /platform/subscription/modules/upsert
// Create or update a subscription module
// =============================================

export const upsertSubscriptionModule = createAsyncThunk<SubscriptionModule, CreateModulePayload, { rejectValue: string }>(
  "admin/upsertSubscriptionModule",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/platform/subscription/modules/upsert`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to save subscription module");
      return data.data;
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

// =============================================
// POST /platform/subscription/assign-modules
// Assign modules to a tenant
// =============================================

export const assignModulesToTenant = createAsyncThunk<any, AssignModulesPayload, { rejectValue: string }>(
  "admin/assignModulesToTenant",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/platform/subscription/assign-modules`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to assign modules");
      return data.data;
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

// =============================================
// PATCH /platform/subscription/update/modules/{tenantId}
// Update modules for a tenant
// =============================================

export const updateTenantModules = createAsyncThunk<any, { tenantId: string; modules: { moduleKey: string; isEnabled: boolean }[] }, { rejectValue: string }>(
  "admin/updateTenantModules",
  async ({ tenantId, modules }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/platform/subscription/update/modules/${tenantId}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ modules }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to update modules");
      return data.data;
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

// =============================================
// GET /platform/subscription/active-subscription/{tenantId}
// Get active subscription for a tenant
// =============================================

export const fetchActiveSubscription = createAsyncThunk<ActiveSubscription, string, { rejectValue: string }>(
  "admin/fetchActiveSubscription",
  async (tenantId, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/platform/subscription/active-subscription/${tenantId}`, { headers: authHeaders() });
      const response = await res.json();
      if (!response.ok) return rejectWithValue(response.message || "Failed to fetch active subscription");
      return response.data;
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

// =============================================
// GET /platform/subscription/subscribed-tenants
// Get all subscribed tenants
// =============================================

export const fetchSubscribedTenants = createAsyncThunk<SubscribedTenant[], void, { rejectValue: string }>(
  "admin/fetchSubscribedTenants",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/platform/subscription/subscribed-tenants`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch subscribed tenants");
      return data.data || [];
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

// =============================================
// POST /platform/subscription/tenant/cancel-subscription/{tenantId}/{subscriptionId}
// Cancel a tenant's subscription
// =============================================

export const cancelSubscription = createAsyncThunk<{ tenantId: string; subscriptionId: string }, { tenantId: string; subscriptionId: string }, { rejectValue: string }>(
  "admin/cancelSubscription",
  async ({ tenantId, subscriptionId }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/platform/subscription/tenant/cancel-subscription/${tenantId}/${subscriptionId}`, {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to cancel subscription");
      return { tenantId, subscriptionId };
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

// Re-export clearActiveSubscription from slice
export { clearActiveSubscription } from "../slices/adminSlice";
