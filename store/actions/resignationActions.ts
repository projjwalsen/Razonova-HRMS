import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// ── Types ────────────────────────────────────────────────────────────────────

export type ResignationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "WITHDRAWN"
  | "CANCELLED"
  | "COMPLETED";

export type ResignationApproverType =
  | "REPORTING_MANAGER"
  | "DEPARTMENT_MANAGER"
  | "COMPANY_ADMIN"
  | "SPECIFIC_USER";

export interface ResignationApprovalPolicy {
  id: string;
  tenantId: string;
  name: string;
  departmentId?: string | null;
  designationId?: string | null;
  approverType: ResignationApproverType;
  userId?: string | null;
  isActive: boolean;
  department?: { id: string; name: string; managerId?: string | null } | null;
  designation?: { id: string; name: string } | null;
  user?: { id: string; name: string; email: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResignationRequest {
  id: string;
  tenantId: string;
  userId: string;
  reason: string;
  preferredLastWorkingDate?: string | null;
  approvedLastWorkingDate?: string | null;
  status: ResignationStatus;
  approverType?: ResignationApproverType | null;
  approverUserId?: string | null;
  approvedById?: string | null;
  rejectedById?: string | null;
  adminRemarks?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  withdrawnAt?: string | null;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    managerId?: string | null;
    departmentId?: string | null;
    designationId?: string | null;
    department?: { id: string; name: string; managerId?: string | null } | null;
    designation?: { id: string; name: string } | null;
  };
  approvedBy?: { id: string; name: string; email: string } | null;
  rejectedBy?: { id: string; name: string; email: string } | null;
}

// ── State ─────────────────────────────────────────────────────────────────────

export interface ResignationState {
  policies: ResignationApprovalPolicy[];
  myRequests: ResignationRequest[];
  pendingApprovals: ResignationRequest[];
  policyLoading: boolean;
  requestLoading: boolean;
  listLoading: boolean;
  approvalLoading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: ResignationState = {
  policies: [],
  myRequests: [],
  pendingApprovals: [],
  policyLoading: false,
  requestLoading: false,
  listLoading: false,
  approvalLoading: false,
  submitting: false,
  error: null,
};

// ── Auth helpers ─────────────────────────────────────────────────────────────

const getToken = (): string | null =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

const authHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// ── Thunks ───────────────────────────────────────────────────────────────────

// GET /org/resignations/policy
export const fetchResignationPolicies = createAsyncThunk<
  ResignationApprovalPolicy[],
  void,
  { rejectValue: string }
>(
  "resignation/fetchPolicies",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/resignations/policy`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch policies");
      return data.data || [];
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// POST /org/resignations/policy
export const upsertResignationPolicy = createAsyncThunk<
  ResignationApprovalPolicy,
  {
    id?: string;
    name: string;
    departmentId?: string | null;
    designationId?: string | null;
    approverType: ResignationApproverType;
    userId?: string | null;
    isActive?: boolean;
  },
  { rejectValue: string }
>(
  "resignation/upsertPolicy",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/resignations/policy`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to save policy");
      return data.data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// GET /org/resignations/my
export const fetchMyResignations = createAsyncThunk<
  ResignationRequest[],
  void,
  { rejectValue: string }
>(
  "resignation/fetchMy",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/resignations/my`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch resignations");
      return data.data || [];
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// POST /org/resignations/request
export const submitResignation = createAsyncThunk<
  ResignationRequest,
  { reason: string; preferredLastWorkingDate?: string },
  { rejectValue: string }
>(
  "resignation/submit",
  async ({ reason, preferredLastWorkingDate }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/resignations/request`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ reason, preferredLastWorkingDate }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to submit resignation");
      return data.data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// GET /org/resignations/pending-approvals
export const fetchPendingResignationApprovals = createAsyncThunk<
  ResignationRequest[],
  void,
  { rejectValue: string }
>(
  "resignation/fetchPending",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/resignations/pending-approvals`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch pending approvals");
      return data.data || [];
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// PATCH /org/resignations/{requestId}/approve
export const approveResignation = createAsyncThunk<
  { id: string; status: ResignationStatus; approvedById: string; approvedAt: string; approvedLastWorkingDate: string; adminRemarks?: string },
  { requestId: string; approvedLastWorkingDate: string; adminRemarks?: string },
  { rejectValue: string }
>(
  "resignation/approve",
  async ({ requestId, approvedLastWorkingDate, adminRemarks }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/resignations/${requestId}/approve`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ approvedLastWorkingDate, adminRemarks }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to approve resignation");
      return data.data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// PATCH /org/resignations/{requestId}/reject
export const rejectResignation = createAsyncThunk<
  { id: string; status: ResignationStatus; rejectedById: string; rejectedAt: string; adminRemarks?: string },
  { requestId: string; remarks?: string },
  { rejectValue: string }
>(
  "resignation/reject",
  async ({ requestId, remarks }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/resignations/${requestId}/reject`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ remarks }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to reject resignation");
      return data.data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// PATCH /org/resignations/{requestId}/withdraw
export const withdrawResignation = createAsyncThunk<
  { id: string; status: ResignationStatus; withdrawnAt: string },
  string,
  { rejectValue: string }
>(
  "resignation/withdraw",
  async (requestId, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/resignations/${requestId}/withdraw`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to withdraw resignation");
      return data.data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// PATCH /org/resignations/{requestId}/complete
export const completeResignation = createAsyncThunk<
  { id: string; status: ResignationStatus; completedAt: string },
  string,
  { rejectValue: string }
>(
  "resignation/complete",
  async (requestId, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/resignations/${requestId}/complete`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to complete resignation");
      return data.data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const resignationSlice = createSlice({
  name: "resignation",
  initialState,
  reducers: {
    clearResignationError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    // fetchPolicies
    builder.addCase(fetchResignationPolicies.pending, (state) => {
      state.policyLoading = true;
      state.error = null;
    });
    builder.addCase(fetchResignationPolicies.fulfilled, (state, action) => {
      state.policyLoading = false;
      state.policies = action.payload;
    });
    builder.addCase(fetchResignationPolicies.rejected, (state, action) => {
      state.policyLoading = false;
      state.error = action.payload as string;
    });

    // upsertPolicy
    builder.addCase(upsertResignationPolicy.pending, (state) => {
      state.approvalLoading = true;
      state.error = null;
    });
    builder.addCase(upsertResignationPolicy.fulfilled, (state, action) => {
      state.approvalLoading = false;
      const policy = action.payload;
      const idx = state.policies.findIndex((p) => p.id === policy.id);
      if (idx >= 0) state.policies[idx] = policy;
      else state.policies.unshift(policy);
    });
    builder.addCase(upsertResignationPolicy.rejected, (state, action) => {
      state.approvalLoading = false;
      state.error = action.payload as string;
    });

    // fetchMyResignations
    builder.addCase(fetchMyResignations.pending, (state) => {
      state.listLoading = true;
      state.error = null;
    });
    builder.addCase(fetchMyResignations.fulfilled, (state, action) => {
      state.listLoading = false;
      state.myRequests = action.payload;
    });
    builder.addCase(fetchMyResignations.rejected, (state, action) => {
      state.listLoading = false;
      state.error = action.payload as string;
    });

    // submitResignation
    builder.addCase(submitResignation.pending, (state) => {
      state.submitting = true;
      state.error = null;
    });
    builder.addCase(submitResignation.fulfilled, (state, action) => {
      state.submitting = false;
      state.myRequests.unshift(action.payload);
    });
    builder.addCase(submitResignation.rejected, (state, action) => {
      state.submitting = false;
      state.error = action.payload as string;
    });

    // fetchPendingApprovals
    builder.addCase(fetchPendingResignationApprovals.pending, (state) => {
      state.listLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPendingResignationApprovals.fulfilled, (state, action) => {
      state.listLoading = false;
      state.pendingApprovals = action.payload;
    });
    builder.addCase(fetchPendingResignationApprovals.rejected, (state, action) => {
      state.listLoading = false;
      state.error = action.payload as string;
    });

    // approveResignation
    builder.addCase(approveResignation.pending, (state) => {
      state.approvalLoading = true;
      state.error = null;
    });
    builder.addCase(approveResignation.fulfilled, (state, action) => {
      state.approvalLoading = false;
      state.pendingApprovals = state.pendingApprovals.filter(
        (r) => r.id !== action.payload.id
      );
    });
    builder.addCase(approveResignation.rejected, (state, action) => {
      state.approvalLoading = false;
      state.error = action.payload as string;
    });

    // rejectResignation
    builder.addCase(rejectResignation.pending, (state) => {
      state.approvalLoading = true;
      state.error = null;
    });
    builder.addCase(rejectResignation.fulfilled, (state, action) => {
      state.approvalLoading = false;
      state.pendingApprovals = state.pendingApprovals.filter(
        (r) => r.id !== action.payload.id
      );
    });
    builder.addCase(rejectResignation.rejected, (state, action) => {
      state.approvalLoading = false;
      state.error = action.payload as string;
    });

    // withdrawResignation
    builder.addCase(withdrawResignation.pending, (state) => { state.submitting = true; state.error = null; });
    builder.addCase(withdrawResignation.fulfilled, (state, action) => {
      state.submitting = false;
      const idx = state.myRequests.findIndex((r) => r.id === action.payload.id);
      if (idx >= 0) state.myRequests[idx].status = "WITHDRAWN";
    });
    builder.addCase(withdrawResignation.rejected, (state, action) => {
      state.submitting = false;
      state.error = action.payload as string;
    });

    // completeResignation
    builder.addCase(completeResignation.pending, (state) => { state.approvalLoading = true; state.error = null; });
    builder.addCase(completeResignation.fulfilled, (state, action) => {
      state.approvalLoading = false;
      state.pendingApprovals = state.pendingApprovals.filter(
        (r) => r.id !== action.payload.id
      );
    });
    builder.addCase(completeResignation.rejected, (state, action) => {
      state.approvalLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearResignationError } = resignationSlice.actions;
export default resignationSlice.reducer;