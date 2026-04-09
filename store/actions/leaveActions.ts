import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// Leave Type Config
export interface LeaveType {
  id?: string;
  name: string;
  typeCode: string;
  maxLimits: number;
  attachmentRequired: boolean;
  priorNoticeDays: number;
  allowHalfDay: boolean;
  sandwichLeaveAllowed: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Leave Request
export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  days: number;
  halfDay?: boolean;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  rejectionReason?: string;
  attachmentUrls?: string[];
  appliedOn?: string;
  createdAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  remarks?: string;
  totalDays?: number;
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
  leaveType?: {
    id: string;
    name?: string;
    typeCode?: string;
    maxLimits?: number;
    attachmentRequired?: boolean;
  };
  approvals?: Array<{
    id: string;
    status: string;
    remarks?: string;
    approver?: {
      id: string;
      name?: string;
      email?: string;
    };
  }>;
}

// Transform API response to LeaveRequest
const transformLeaveRequest = (record: any): LeaveRequest => {
  return {
    ...record,
    employeeId: record.user?.id || record.employeeId,
    employeeName: record.user?.name || record.employeeName || 'Unknown',
    employeeEmail: record.user?.email || record.employeeEmail || '',
    leaveTypeId: record.leaveType?.id || record.leaveTypeId,
    leaveTypeName: record.leaveType?.name || record.leaveTypeName || 'Unknown',
    days: record.totalDays || record.days || 0,
    totalDays: record.totalDays || record.days || 0,
    attachmentUrls: record.attachmentUrls || [],
  };
};

// Leave Balance
export interface LeaveBalance {
  leaveTypeId: string;
  leaveTypeName: string;
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
}

export interface LeaveState {
  leaveTypes: LeaveType[];
  leaveRequests: LeaveRequest[];
  myRequests: LeaveRequest[];
  leaveBalances: LeaveBalance[];
  loading: boolean;
  submitting: boolean;
  approving: boolean;
  rejecting: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: LeaveState = {
  leaveTypes: [],
  leaveRequests: [],
  myRequests: [],
  leaveBalances: [],
  loading: false,
  submitting: false,
  approving: false,
  rejecting: false,
  error: null,
  successMessage: null,
};

// Helper to get token from localStorage
const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

const getAuthHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Fetch Leave Types (Config)
export const fetchLeaveTypes = createAsyncThunk<LeaveType[]>(
  "leave/fetchTypes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/type`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch leave types");
      }

      return data.data || data || [];
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Create/Update Leave Type
export const saveLeaveType = createAsyncThunk<LeaveType, LeaveType>(
  "leave/saveType",
  async (leaveType, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/type`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(leaveType),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to save leave type");
      }

      return data.data || data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Fetch All Leave Requests
export const fetchLeaveRequests = createAsyncThunk<LeaveRequest[]>(
  "leave/fetchRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/requests`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch leave requests");
      }

      const records = data.data || data || [];
      return Array.isArray(records) ? records.map(transformLeaveRequest) : [];
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Fetch My Leave Requests
export const fetchMyLeaveRequests = createAsyncThunk<LeaveRequest[]>(
  "leave/fetchMyRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/my-requests`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch your leave requests");
      }

      const records = data.data || data || [];
      return Array.isArray(records) ? records.map(transformLeaveRequest) : [];
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Fetch Leave Balances
export const fetchLeaveBalances = createAsyncThunk<LeaveBalance[]>(
  "leave/fetchBalances",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/balance`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch leave balances");
      }

      return data.data || data || [];
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Apply for Leave
export interface ApplyLeavePayload {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  halfDay?: boolean;
  attachment?: File | null;
}

export const applyForLeave = createAsyncThunk<LeaveRequest, ApplyLeavePayload>(
  "leave/apply",
  async (payload, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("leaveTypeId", payload.leaveTypeId);
      formData.append("startDate", payload.startDate);
      formData.append("endDate", payload.endDate);
      formData.append("reason", payload.reason);
      if (payload.halfDay !== undefined) {
        formData.append("halfDay", String(payload.halfDay));
      }
      if (payload.attachment) {
        formData.append("attachment", payload.attachment);
      }

      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/apply`,
        {
          method: "POST",
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to apply for leave");
      }

      return data.data || data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Approve Leave
export const approveLeave = createAsyncThunk<{ requestId: string; remarks?: string }, { requestId: string; remarks?: string }>(
  "leave/approve",
  async ({ requestId, remarks }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/approve/${requestId}`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ remarks }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to approve leave request");
      }

      return { requestId, remarks };
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Reject Leave
export const rejectLeave = createAsyncThunk<{ requestId: string; remarks?: string }, { requestId: string; remarks?: string }>(
  "leave/reject",
  async ({ requestId, remarks }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/reject/${requestId}`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ remarks }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to reject leave request");
      }

      return { requestId, remarks };
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

const leaveSlice = createSlice({
  name: "leave",
  initialState,
  reducers: {
    clearLeaveError: (state) => {
      state.error = null;
    },
    clearLeaveSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Leave Types
    builder.addCase(fetchLeaveTypes.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchLeaveTypes.fulfilled, (state, action: PayloadAction<LeaveType[]>) => {
      state.loading = false;
      state.leaveTypes = action.payload;
    });
    builder.addCase(fetchLeaveTypes.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Save Leave Type
    builder.addCase(saveLeaveType.pending, (state) => {
      state.submitting = true;
      state.error = null;
    });
    builder.addCase(saveLeaveType.fulfilled, (state, action: PayloadAction<LeaveType>) => {
      state.submitting = false;
      const index = state.leaveTypes.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.leaveTypes[index] = action.payload;
      } else {
        state.leaveTypes.push(action.payload);
      }
      state.successMessage = "Leave type saved successfully";
    });
    builder.addCase(saveLeaveType.rejected, (state, action) => {
      state.submitting = false;
      state.error = action.payload as string;
    });

    // Fetch Leave Requests
    builder.addCase(fetchLeaveRequests.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchLeaveRequests.fulfilled, (state, action: PayloadAction<LeaveRequest[]>) => {
      state.loading = false;
      state.leaveRequests = action.payload;
    });
    builder.addCase(fetchLeaveRequests.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch My Leave Requests
    builder.addCase(fetchMyLeaveRequests.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMyLeaveRequests.fulfilled, (state, action: PayloadAction<LeaveRequest[]>) => {
      state.loading = false;
      state.myRequests = action.payload;
    });
    builder.addCase(fetchMyLeaveRequests.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Leave Balances
    builder.addCase(fetchLeaveBalances.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchLeaveBalances.fulfilled, (state, action: PayloadAction<LeaveBalance[]>) => {
      state.loading = false;
      state.leaveBalances = action.payload;
    });
    builder.addCase(fetchLeaveBalances.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Apply for Leave
    builder.addCase(applyForLeave.pending, (state) => {
      state.submitting = true;
      state.error = null;
    });
    builder.addCase(applyForLeave.fulfilled, (state, action: PayloadAction<LeaveRequest>) => {
      state.submitting = false;
      state.myRequests.unshift(action.payload);
      state.successMessage = "Leave application submitted successfully";
    });
    builder.addCase(applyForLeave.rejected, (state, action) => {
      state.submitting = false;
      state.error = action.payload as string;
    });

    // Approve Leave
    builder.addCase(approveLeave.pending, (state) => {
      state.approving = true;
      state.error = null;
    });
    builder.addCase(approveLeave.fulfilled, (state, action) => {
      state.approving = false;
      const request = state.leaveRequests.find((r) => r.id === action.payload.requestId);
      if (request) {
        request.status = "APPROVED";
        request.remarks = action.payload.remarks;
      }
      state.successMessage = "Leave request approved";
    });
    builder.addCase(approveLeave.rejected, (state, action) => {
      state.approving = false;
      state.error = action.payload as string;
    });

    // Reject Leave
    builder.addCase(rejectLeave.pending, (state) => {
      state.rejecting = true;
      state.error = null;
    });
    builder.addCase(rejectLeave.fulfilled, (state, action) => {
      state.rejecting = false;
      const request = state.leaveRequests.find((r) => r.id === action.payload.requestId);
      if (request) {
        request.status = "REJECTED";
        request.remarks = action.payload.remarks;
      }
      state.successMessage = "Leave request rejected";
    });
    builder.addCase(rejectLeave.rejected, (state, action) => {
      state.rejecting = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearLeaveError, clearLeaveSuccess } = leaveSlice.actions;
export default leaveSlice.reducer;
