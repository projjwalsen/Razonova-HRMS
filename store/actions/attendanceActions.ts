import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AttendanceConfig {
  checkInTime: string;
  checkOutTime: string;
  graceMinutes: number;
  halfDayMinutes: number;
  fullDayMinutes: number;
  workingDays?: string[]; // ["MON", "TUE", "WED", "THU", "FRI"]
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY" | "ON_LEAVE" | "HOLIDAY" | "WEEK_OFF" | "PENDING";
  hoursWorked?: string;
  remarks?: string;
  // API response fields
  checkInAt?: string;
  checkOutAt?: string;
  workedMinutes?: number;
  // Location fields
  lat?: number;
  lng?: number;
  address?: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
  actionState?: {
    disableCheckIn: boolean;
    disableCheckOut: boolean;
    reason: string;
  };
}

// Helper to transform API response to AttendanceRecord
const transformAttendanceRecord = (record: any): AttendanceRecord => {
  return {
    ...record,
    userId: record.user?.id || record.userId,
    userName: record.user?.name || record.userName || 'Unknown',
    userEmail: record.user?.email || record.userEmail || '',
    checkIn: record.checkInAt ? new Date(record.checkInAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : record.checkIn,
    checkOut: record.checkOutAt ? new Date(record.checkOutAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : record.checkOut,
    hoursWorked: record.workedMinutes ? `${(record.workedMinutes / 60).toFixed(1)}h` : record.hoursWorked,
  };
};

export interface AttendanceSummary {
  userId: string;
  userName: string;
  month: string;
  year: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  halfDays: number;
  totalHours: string;
  averageHoursPerDay: string;
}

export interface OutDutyRecord {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "ACTIVE" | "INACTIVE";
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceState {
  config: AttendanceConfig | null;
  todayAttendance: AttendanceRecord[];
  attendanceHistory: AttendanceRecord[];
  monthlySummary: AttendanceSummary[];
  selectedUserAttendance: AttendanceRecord | null;
  selectedUserSummary: AttendanceSummary | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  // Regularization
  policies: RegularizationPolicy[];
  myRequests: AttendanceRegularizationRequest[];
  pendingApprovals: AttendanceRegularizationRequest[];
  policyLoading: boolean;
  requestLoading: boolean;
  listLoading: boolean;
  approvalLoading: boolean;
  // Out Duty
  outDutyRecords: OutDutyRecord[];
  outDutyLoading: boolean;
}

const initialState: AttendanceState = {
  config: null,
  todayAttendance: [],
  attendanceHistory: [],
  monthlySummary: [],
  selectedUserAttendance: null,
  selectedUserSummary: null,
  loading: false,
  saving: false,
  error: null,
  policies: [],
  myRequests: [],
  pendingApprovals: [],
  policyLoading: false,
  requestLoading: false,
  listLoading: false,
  approvalLoading: false,
  outDutyRecords: [],
  outDutyLoading: false,
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

// Fetch Attendance Config
export const fetchAttendanceConfig = createAsyncThunk<AttendanceConfig>(
  "attendance/fetchConfig",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/attendance/config`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch attendance config");
      }

      return data.data || data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Save Attendance Config
export const saveAttendanceConfig = createAsyncThunk<AttendanceConfig, AttendanceConfig>(
  "attendance/saveConfig",
  async (config, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/attendance/config/upsert`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(config),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to save attendance config");
      }

      return data.data || data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Fetch Today's Attendance
export const fetchTodayAttendance = createAsyncThunk<AttendanceRecord[]>(
  "attendance/fetchToday",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/attendance/today`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch today's attendance");
      }

      const records = data.data || data || [];
      return Array.isArray(records) ? records.map(transformAttendanceRecord) : [];
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Check In
export const checkIn = createAsyncThunk<
  AttendanceRecord,
  { lat: number; lng: number; address?: string },
  { rejectValue: string }
>(
  "attendance/checkIn",
  async ({ lat, lng, address }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/attendance/check-in`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ lat, lng, address }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to check in");
      }

      return transformAttendanceRecord(data.data || data);
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Check Out
export const checkOut = createAsyncThunk<
  AttendanceRecord,
  { lat: number; lng: number; address?: string },
  { rejectValue: string }
>(
  "attendance/checkOut",
  async ({ lat, lng, address }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/attendance/check-out`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ lat, lng, address }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to check out");
      }

      return transformAttendanceRecord(data.data || data);
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Fetch User's Today's Attendance Details
export const fetchUserTodayAttendance = createAsyncThunk<AttendanceRecord, string>(
  "attendance/fetchUserToday",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/attendance/today/${userId}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch user attendance");
      }

      // Handle both array and single object responses
      const record = Array.isArray(data.data) ? data.data[0] : data.data || data;
      return transformAttendanceRecord(record);
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Fetch Attendance History
export const fetchAttendanceHistory = createAsyncThunk<AttendanceRecord[]>(
  "attendance/fetchHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/attendance/history`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch attendance history");
      }

      const records = data.data || data || [];
      return Array.isArray(records) ? records.map(transformAttendanceRecord) : [];
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Fetch User's Attendance History
export const fetchUserAttendanceHistory = createAsyncThunk<AttendanceRecord, string>(
  "attendance/fetchUserHistory",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/attendance/history/${userId}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch user history");
      }

      return transformAttendanceRecord(data.data || data);
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Fetch Monthly Attendance Summary
export const fetchMonthlySummary = createAsyncThunk<AttendanceSummary[]>(
  "attendance/fetchSummary",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/attendance/monthly`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch monthly summary");
      }

      return data.data || data || [];
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Fetch User's Monthly Summary
export const fetchUserMonthlySummary = createAsyncThunk<AttendanceSummary, string>(
  "attendance/fetchUserSummary",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/attendance/monthly/${userId}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch user summary");
      }

      return data.data || data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// ── Regularization Types ───────────────────────────────────────────────────

export type RegularizationStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type RegularizationApproverType =
  | "REPORTING_MANAGER"
  | "DEPARTMENT_MANAGER"
  | "COMPANY_ADMIN"
  | "SPECIFIC_USER";

export interface RegularizationPolicy {
  id: string;
  tenantId: string;
  name: string;
  departmentId?: string | null;
  designationId?: string | null;
  approverType: RegularizationApproverType;
  userId?: string | null;
  isActive: boolean;
  department?: { id: string; name: string } | null;
  designation?: { id: string; name: string } | null;
  user?: { id: string; name: string; email: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceRegularizationRequest {
  id: string;
  tenantId: string;
  userId: string;
  attendanceId?: string | null;
  date: string;
  requestedCheckInAt?: string | null;
  requestedCheckOutAt?: string | null;
  reason: string;
  status: RegularizationStatus;
  approverType?: RegularizationApproverType | null;
  approverUserId?: string | null;
  approvedById?: string | null;
  rejectedById?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    department?: { id: string; name: string } | null;
    designation?: { id: string; name: string } | null;
  };
  createdAt?: string;
  updatedAt?: string;
}

// ── Regularization Thunks ────────────────────────────────────────────────

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// GET /attendance/regularization/policy
export const fetchRegularizationPolicies = createAsyncThunk<
  RegularizationPolicy[],
  void,
  { rejectValue: string }
>(
  "attendance/fetchRegularizationPolicies",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/attendance/regularization/policy`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch policies");
      return data.data || [];
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// POST /attendance/regularization/policy
export const upsertRegularizationPolicy = createAsyncThunk<
  RegularizationPolicy,
  {
    id?: string;
    name: string;
    departmentId?: string | null;
    designationId?: string | null;
    approverType: RegularizationApproverType;
    userId?: string | null;
    isActive?: boolean;
  },
  { rejectValue: string }
>(
  "attendance/upsertRegularizationPolicy",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/attendance/regularization/policy`, {
        method: "POST",
        headers: getAuthHeaders(),
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

// POST /attendance/regularization/request
export const createRegularizationRequest = createAsyncThunk<
  AttendanceRegularizationRequest,
  {
    date: string;
    requestedCheckInAt?: string;
    requestedCheckOutAt?: string;
    reason: string;
  },
  { rejectValue: string }
>(
  "attendance/createRegularizationRequest",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/attendance/regularization/request`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to create request");
      return data.data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// GET /attendance/regularization/my-requests
export const fetchMyRegularizationRequests = createAsyncThunk<
  AttendanceRegularizationRequest[],
  void,
  { rejectValue: string }
>(
  "attendance/fetchMyRegularizationRequests",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/attendance/regularization/my-requests`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch requests");
      return data.data || [];
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// GET /attendance/regularization/pending-approvals
export const fetchPendingRegularizationApprovals = createAsyncThunk<
  AttendanceRegularizationRequest[],
  void,
  { rejectValue: string }
>(
  "attendance/fetchPendingRegularizationApprovals",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/attendance/regularization/pending-approvals`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch pending approvals");
      return data.data || [];
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// PATCH /attendance/regularization/:requestId/approve
export const approveRegularizationRequest = createAsyncThunk<
  { id: string; status: RegularizationStatus; approvedById: string; approvedAt: string },
  { requestId: string; remarks?: string },
  { rejectValue: string }
>(
  "attendance/approveRegularizationRequest",
  async ({ requestId, remarks }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/attendance/regularization/${requestId}/approve`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ remarks }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to approve request");
      return data.data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// PATCH /attendance/regularization/:requestId/reject
export const rejectRegularizationRequest = createAsyncThunk<
  { id: string; status: RegularizationStatus; rejectedById: string; rejectedAt: string; rejectionReason: string },
  { requestId: string; remarks?: string },
  { rejectValue: string }
>(
  "attendance/rejectRegularizationRequest",
  async ({ requestId, remarks }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/attendance/regularization/${requestId}/reject`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ remarks }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to reject request");
      return data.data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// POST /attendance/out-duty
export const createOutDuty = createAsyncThunk<
  OutDutyRecord,
  { userId: string; startDate: string; endDate: string; reason: string },
  { rejectValue: string }
>(
  "attendance/createOutDuty",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/attendance/out-duty`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to create out-duty record");
      return data.data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// GET /attendance/out-duty
export const fetchOutDutyRecords = createAsyncThunk<
  OutDutyRecord[],
  void,
  { rejectValue: string }
>(
  "attendance/fetchOutDutyRecords",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/attendance/out-duty`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch out-duty records");
      return data.data || [];
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// DELETE /attendance/out-duty/:id
export const deleteOutDutyRecord = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "attendance/deleteOutDutyRecord",
  async (id, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/attendance/out-duty/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to delete out-duty record");
      return id;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    clearAttendanceError: (state) => {
      state.error = null;
    },
    clearSelectedUser: (state) => {
      state.selectedUserAttendance = null;
      state.selectedUserSummary = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Config
    builder.addCase(fetchAttendanceConfig.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchAttendanceConfig.fulfilled,
      (state, action: PayloadAction<AttendanceConfig>) => {
        state.loading = false;
        state.config = action.payload;
      }
    );
    builder.addCase(fetchAttendanceConfig.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Save Config
    builder.addCase(saveAttendanceConfig.pending, (state) => {
      state.saving = true;
      state.error = null;
    });
    builder.addCase(
      saveAttendanceConfig.fulfilled,
      (state, action: PayloadAction<AttendanceConfig>) => {
        state.saving = false;
        state.config = action.payload;
      }
    );
    builder.addCase(saveAttendanceConfig.rejected, (state, action) => {
      state.saving = false;
      state.error = action.payload as string;
    });

    // Fetch Today's Attendance
    builder.addCase(fetchTodayAttendance.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchTodayAttendance.fulfilled,
      (state, action: PayloadAction<AttendanceRecord[]>) => {
        state.loading = false;
        state.todayAttendance = action.payload;
      }
    );
    builder.addCase(fetchTodayAttendance.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Check In
    builder.addCase(checkIn.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      checkIn.fulfilled,
      (state, action: PayloadAction<AttendanceRecord>) => {
        state.loading = false;
        // Add or update the check-in record
        const existingIndex = state.todayAttendance.findIndex(
          (r) => r.userId === action.payload.userId
        );
        if (existingIndex !== -1) {
          state.todayAttendance[existingIndex] = action.payload;
        } else {
          state.todayAttendance.push(action.payload);
        }
      }
    );
    builder.addCase(checkIn.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Check Out
    builder.addCase(checkOut.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      checkOut.fulfilled,
      (state, action: PayloadAction<AttendanceRecord>) => {
        state.loading = false;
        // Update the check-out record
        const existingIndex = state.todayAttendance.findIndex(
          (r) => r.userId === action.payload.userId
        );
        if (existingIndex !== -1) {
          state.todayAttendance[existingIndex] = action.payload;
        } else {
          state.todayAttendance.push(action.payload);
        }
      }
    );
    builder.addCase(checkOut.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch User Today's Attendance
    builder.addCase(fetchUserTodayAttendance.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchUserTodayAttendance.fulfilled,
      (state, action: PayloadAction<AttendanceRecord>) => {
        state.loading = false;
        state.selectedUserAttendance = action.payload;
      }
    );
    builder.addCase(fetchUserTodayAttendance.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Attendance History
    builder.addCase(fetchAttendanceHistory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchAttendanceHistory.fulfilled,
      (state, action: PayloadAction<AttendanceRecord[]>) => {
        state.loading = false;
        state.attendanceHistory = action.payload;
      }
    );
    builder.addCase(fetchAttendanceHistory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch User Attendance History
    builder.addCase(fetchUserAttendanceHistory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchUserAttendanceHistory.fulfilled,
      (state, action: PayloadAction<AttendanceRecord>) => {
        state.loading = false;
        state.selectedUserAttendance = action.payload;
      }
    );
    builder.addCase(fetchUserAttendanceHistory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Monthly Summary
    builder.addCase(fetchMonthlySummary.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchMonthlySummary.fulfilled,
      (state, action: PayloadAction<AttendanceSummary[]>) => {
        state.loading = false;
        state.monthlySummary = action.payload;
      }
    );
    builder.addCase(fetchMonthlySummary.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch User Monthly Summary
    builder.addCase(fetchUserMonthlySummary.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchUserMonthlySummary.fulfilled,
      (state, action: PayloadAction<AttendanceSummary>) => {
        state.loading = false;
        state.selectedUserSummary = action.payload;
      }
    );
    builder.addCase(fetchUserMonthlySummary.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // ── Regularization Reducers ─────────────────────────────────────────────

    // fetchRegularizationPolicies
    builder.addCase(fetchRegularizationPolicies.pending, (state) => {
      state.policyLoading = true;
      state.error = null;
    });
    builder.addCase(fetchRegularizationPolicies.fulfilled, (state, action) => {
      state.policyLoading = false;
      state.policies = action.payload;
    });
    builder.addCase(fetchRegularizationPolicies.rejected, (state, action) => {
      state.policyLoading = false;
      state.error = action.payload as string;
    });

    // upsertRegularizationPolicy
    builder.addCase(upsertRegularizationPolicy.pending, (state) => {
      state.saving = true;
      state.error = null;
    });
    builder.addCase(upsertRegularizationPolicy.fulfilled, (state, action) => {
      state.saving = false;
      const policy = action.payload;
      const idx = state.policies.findIndex((p) => p.id === policy.id);
      if (idx >= 0) {
        state.policies[idx] = policy;
      } else {
        state.policies.unshift(policy);
      }
    });
    builder.addCase(upsertRegularizationPolicy.rejected, (state, action) => {
      state.saving = false;
      state.error = action.payload as string;
    });

    // createRegularizationRequest
    builder.addCase(createRegularizationRequest.pending, (state) => {
      state.requestLoading = true;
      state.error = null;
    });
    builder.addCase(createRegularizationRequest.fulfilled, (state, action) => {
      state.requestLoading = false;
      state.myRequests.unshift(action.payload);
    });
    builder.addCase(createRegularizationRequest.rejected, (state, action) => {
      state.requestLoading = false;
      state.error = action.payload as string;
    });

    // fetchMyRegularizationRequests
    builder.addCase(fetchMyRegularizationRequests.pending, (state) => {
      state.listLoading = true;
      state.error = null;
    });
    builder.addCase(fetchMyRegularizationRequests.fulfilled, (state, action) => {
      state.listLoading = false;
      state.myRequests = action.payload;
    });
    builder.addCase(fetchMyRegularizationRequests.rejected, (state, action) => {
      state.listLoading = false;
      state.error = action.payload as string;
    });

    // fetchPendingRegularizationApprovals
    builder.addCase(fetchPendingRegularizationApprovals.pending, (state) => {
      state.listLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPendingRegularizationApprovals.fulfilled, (state, action) => {
      state.listLoading = false;
      state.pendingApprovals = action.payload;
    });
    builder.addCase(fetchPendingRegularizationApprovals.rejected, (state, action) => {
      state.listLoading = false;
      state.error = action.payload as string;
    });

    // approveRegularizationRequest
    builder.addCase(approveRegularizationRequest.pending, (state) => {
      state.approvalLoading = true;
      state.error = null;
    });
    builder.addCase(approveRegularizationRequest.fulfilled, (state, action) => {
      state.approvalLoading = false;
      state.pendingApprovals = state.pendingApprovals.filter(
        (r) => r.id !== action.payload.id
      );
    });
    builder.addCase(approveRegularizationRequest.rejected, (state, action) => {
      state.approvalLoading = false;
      state.error = action.payload as string;
    });

    // rejectRegularizationRequest
    builder.addCase(rejectRegularizationRequest.pending, (state) => {
      state.approvalLoading = true;
      state.error = null;
    });
    builder.addCase(rejectRegularizationRequest.fulfilled, (state, action) => {
      state.approvalLoading = false;
      state.pendingApprovals = state.pendingApprovals.filter(
        (r) => r.id !== action.payload.id
      );
    });
    builder.addCase(rejectRegularizationRequest.rejected, (state, action) => {
      state.approvalLoading = false;
      state.error = action.payload as string;
    });

    // createOutDuty
    builder.addCase(createOutDuty.pending, (state) => {
      state.saving = true;
      state.error = null;
    });
    builder.addCase(createOutDuty.fulfilled, (state, action) => {
      state.saving = false;
      state.outDutyRecords.unshift(action.payload);
    });
    builder.addCase(createOutDuty.rejected, (state, action) => {
      state.saving = false;
      state.error = action.payload as string;
    });

    // fetchOutDutyRecords
    builder.addCase(fetchOutDutyRecords.pending, (state) => {
      state.outDutyLoading = true;
      state.error = null;
    });
    builder.addCase(fetchOutDutyRecords.fulfilled, (state, action) => {
      state.outDutyLoading = false;
      state.outDutyRecords = action.payload;
    });
    builder.addCase(fetchOutDutyRecords.rejected, (state, action) => {
      state.outDutyLoading = false;
      state.error = action.payload as string;
    });

    // deleteOutDutyRecord
    builder.addCase(deleteOutDutyRecord.fulfilled, (state, action) => {
      state.outDutyRecords = state.outDutyRecords.filter((r) => r.id !== action.payload);
    });
  },
});

export const { clearAttendanceError, clearSelectedUser } = attendanceSlice.actions;
export default attendanceSlice.reducer;
