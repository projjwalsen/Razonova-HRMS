import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// =============================================
// ENUMS & TYPES
// =============================================

export type EmploymentType = "FULL_TIME" | "TRAINEE" | "INTERN" | "CONTRACT" | "OTHER";
export type LeaveTypeCode = "CASUAL" | "SICK" | "MATERNITY" | "PATERNITY" | "EARNED" | "UNPAID";
export type LeaveApproverType = "REPORTING_MANAGER" | "DEPARTMENT_MANAGER" | "COMPANY_ADMIN" | "SPECIFIC_USER" | "ROLE";
export type LeaveCountMode = "CALENDAR_DAYS" | "WORKING_DAYS";
export type LeaveAccrualFrequency = "MONTHLY" | "QUARTERLY" | "YEARLY";
export type HolidayRegionType = "GLOBAL" | "COUNTRY" | "STATE" | "CITY" | "CUSTOM";
export type WorkingDay = "SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY";
export type LeaveRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "PARTIALLY_APPROVED";

// =============================================
// LEAVE TYPE
// =============================================
export interface LeaveType {
  id?: string;
  name: string;
  typeCode: LeaveTypeCode;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// =============================================
// LEAVE POLICY & RULES
// =============================================
export interface PolicyRule {
  id?: string;
  leaveTypeId: string;
  leaveTypeName?: string;
  annualAllocation: number;
  maxPerRequest: number;
  maxPerYear: number;
  maxConsecutiveDays: number;
  allowDuringProbation: boolean;
  attachmentRequired: boolean;
  priorNoticeDays: number;
  sandwichLeaveAllowed: boolean;
  countMode: LeaveCountMode;
  isPaid: boolean;
  carryForwardAllowed: boolean;
  carryForwardLimit: number;
  accrualFrequency: LeaveAccrualFrequency;
  accrualAmount: number;
  leaveType?: {
    id: string;
    name?: string;
    typeCode?: LeaveTypeCode;
  };
}

export interface LeavePolicy {
  id?: string;
  name: string;
  employmentType: EmploymentType;
  probationMonths: number;
  isActive?: boolean;
  rules?: PolicyRule[];
  createdAt?: string;
  updatedAt?: string;
}

// =============================================
// APPROVAL POLICY & LEVELS
// =============================================
export interface ApprovalLevel {
  id?: string;
  level: number;
  approverType: LeaveApproverType;
  roleId?: string;
  roleName?: string;
  userId?: string;
  userName?: string;
  minApprovals: number;
  createdAt?: string;
  updatedAt?: string;
  role?: Record<string, unknown> | null;
  user?: {
    id: string;
    name?: string;
    email?: string;
  } | null;
}

export interface ApprovalPolicy {
  id?: string;
  name: string;
  leavePolicyId?: string;
  leavePolicyName?: string;
  leaveTypeId?: string;
  leaveTypeName?: string;
  departmentId?: string;
  departmentName?: string;
  designationId?: string;
  designationName?: string;
  isActive?: boolean;
  levels?: ApprovalLevel[];
  createdAt?: string;
  updatedAt?: string;
  leavePolicy?: {
    id: string;
    name: string;
    employmentType: EmploymentType;
    probationMonths?: number;
    isActive?: boolean;
  };
  leaveType?: {
    id: string;
    name: string;
    typeCode: LeaveTypeCode;
    isActive?: boolean;
  };
  department?: Record<string, unknown> | null;
  designation?: Record<string, unknown> | null;
}

// =============================================
// HOLIDAY CALENDAR & HOLIDAYS
// =============================================
export interface Holiday {
  id: string;
  holidayCalendarId?: string;
  name: string;
  date: string;
  isOptional?: boolean;
  createdAt?: string;
}

export interface HolidayCalendar {
  id: string;
  name: string;
  regionType?: HolidayRegionType;
  country?: string;
  state?: string;
  city?: string;
  year?: number;
  isDefault?: boolean;
  isActive?: boolean;
  holidays?: Holiday[];
  createdAt?: string;
  updatedAt?: string;
}

// =============================================
// WORK WEEK
// =============================================
export interface WorkWeek {
  workingDays: WorkingDay[];
}

// =============================================
// LEAVE REQUEST
// =============================================
export interface LeaveRequest {
  id: string;
  userId?: string;
  employeeName?: string;
  employeeEmail?: string;
  leaveTypeId?: string;
  leaveTypeName?: string;
  leavePolicyId?: string;
  leavePolicyName?: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status?: LeaveRequestStatus;
  attachmentUrls?: string[];
  appliedOn?: string;
  createdAt?: string;
  updatedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  remarks?: string;
  rejectionReason?: string;
  currentApprovalLevel?: number;
  approvalPolicyId?: string;
  leavePolicyRuleId?: string;
  tenantId?: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
  leaveType?: {
    id: string;
    name?: string;
    typeCode?: string;
  };
  leavePolicy?: {
    id: string;
    name?: string;
    employmentType?: string;
    probationMonths?: number;
  };
  approvals?: LeaveApproval[];
}

export interface LeaveApproval {
  id: string;
  leaveRequestId?: string;
  level: number;
  approverId?: string;
  decision?: string;
  remarks?: string | null;
  actedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  approver?: {
    id: string;
    name?: string;
    email?: string;
  };
}

export interface ApprovalRecord {
  id: string;
  level: number;
  approverName?: string;
  status: string;
  remarks?: string;
  actionAt?: string;
}

// =============================================
// LEAVE BALANCE
// =============================================
export interface LeaveBalance {
  id?: string;
  userId?: string;
  tenantId?: string;
  leaveTypeId: string;
  leaveTypeName?: string;
  leaveTypeCode?: LeaveTypeCode;
  year?: number;
  allocatedDays: number;
  takenDays: number;
  carriedForwardDays: number;
  usedDays: number;
  remainingDays: number;
  pending?: number;
  available?: number;
  allocated?: number;
  used?: number;
  carryForward?: number;
  createdAt?: string;
  updatedAt?: string;
  leaveType?: {
    id: string;
    name?: string;
    typeCode?: LeaveTypeCode;
    isActive?: boolean;
  };
}

// =============================================
// APPLY LEAVE PAYLOAD
// =============================================
export interface ApplyLeavePayload {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  attachments?: File[];
}

// =============================================
// STORE STATE
// =============================================
export interface LeaveState {
  // data
  leaveTypes: LeaveType[];
  leavePolicies: LeavePolicy[];
  approvalPolicies: ApprovalPolicy[];
  holidayCalendars: HolidayCalendar[];
  activeHolidayCalendar: HolidayCalendar | null;
  workWeek: WorkWeek | null;
  leaveRequests: LeaveRequest[];
  myRequests: LeaveRequest[];
  myBalances: LeaveBalance[];

  // ui state
  loading: boolean;
  submitting: boolean;
  actionLoading: string | null;
  error: string | null;
  successMessage: string | null;

  // selected items
  selectedRequest: LeaveRequest | null;
  selectedCalendar: HolidayCalendar | null;
}

// =============================================
// INITIAL STATE
// =============================================
const initialState: LeaveState = {
  leaveTypes: [],
  leavePolicies: [],
  approvalPolicies: [],
  holidayCalendars: [],
  activeHolidayCalendar: null,
  workWeek: null,
  leaveRequests: [],
  myRequests: [],
  myBalances: [],
  loading: false,
  submitting: false,
  actionLoading: null,
  error: null,
  successMessage: null,
  selectedRequest: null,
  selectedCalendar: null,
};

// =============================================
// HELPERS
// =============================================
const getToken = (): string | null => {
  if (typeof window !== "undefined") return localStorage.getItem("token");
  return null;
};

const authHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};



// =============================================
// THUNKS - LEAVE TYPES
// =============================================
export const fetchLeaveTypes = createAsyncThunk<LeaveType[], void, { rejectValue: string }>(
  "leave/fetchTypes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/type`, {
        method: "GET",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch leave types");
      return Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const createLeaveType = createAsyncThunk<LeaveType, Partial<LeaveType>, { rejectValue: string }>(
  "leave/createType",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/type`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to create leave type");
      return data.data || data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const updateLeaveType = createAsyncThunk<LeaveType, Partial<LeaveType>, { rejectValue: string }>(
  "leave/updateType",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/type`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to update leave type");
      return data.data || data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// =============================================
// THUNKS - LEAVE POLICIES
// =============================================
export const fetchLeavePolicies = createAsyncThunk<LeavePolicy[], void, { rejectValue: string }>(
  "leave/fetchPolicies",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/policy`, {
        method: "GET",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch leave policies");
      return Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const createLeavePolicy = createAsyncThunk<LeavePolicy, Partial<LeavePolicy>, { rejectValue: string }>(
  "leave/createPolicy",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/policy`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to create leave policy");
      return data.data || data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// =============================================
// USER SELECT OPTIONS
// =============================================
export interface UserSelectOption {
  id: string;
  name: string;
  email: string;
  phone?: string;
  managerId?: string;
  isActive?: boolean;
  employeeCode?: string;
  employmentType?: string;
  joiningDate?: string;
  probationMonths?: number;
  salary?: number;
  dateOfBirth?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
  department?: {
    id?: string;
    name?: string;
    [key: string]: unknown;
  };
  designation?: {
    id?: string;
    name?: string;
    [key: string]: unknown;
  };
  manager?: {
    id?: string;
    name?: string;
    [key: string]: unknown;
  };
}

export interface UpdateUserPayload {
  name?: string;
  phone?: string;
  departmentId?: string;
  designationId?: string;
  managerId?: string;
  isActive?: boolean;
  employeeCode?: string;
  employmentType?: string;
  joiningDate?: string;
  probationMonths?: number;
  salary?: number;
  dateOfBirth?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
}

export const fetchUserSelectOptions = createAsyncThunk<UserSelectOption[], void, { rejectValue: string }>(
  "leave/fetchUserSelectOptions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/org/users/select-options`, {
        method: "GET",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch user options");
      return Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const updateUser = createAsyncThunk<UserSelectOption, { userId: string; payload: UpdateUserPayload }, { rejectValue: string }>(
  "leave/updateUser",
  async ({ userId, payload }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/org/users/update/${userId}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to update user");
      return data.data || data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// =============================================
// THUNKS - APPROVAL POLICIES
// =============================================
export const fetchApprovalPolicies = createAsyncThunk<ApprovalPolicy[], void, { rejectValue: string }>(
  "leave/fetchApprovalPolicies",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/approval-policy`, {
        method: "GET",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch approval policies");
      return Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const createApprovalPolicy = createAsyncThunk<ApprovalPolicy, Partial<ApprovalPolicy>, { rejectValue: string }>(
  "leave/createApprovalPolicy",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/approval-policy`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to create approval policy");
      return data.data || data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// =============================================
// THUNKS - HOLIDAY CALENDARS
// =============================================
export const fetchHolidayCalendars = createAsyncThunk<HolidayCalendar[], void, { rejectValue: string }>(
  "leave/fetchHolidayCalendars",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/holiday-calendars`, {
        method: "GET",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch holiday calendars");
      return Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const fetchActiveHolidayCalendar = createAsyncThunk<HolidayCalendar | null, void, { rejectValue: string }>(
  "leave/fetchActiveHolidayCalendar",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/holiday-calendar/active`, {
        method: "GET",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch active holiday calendar");
      return data.data || data.holidays ? data : null;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const createHolidayCalendar = createAsyncThunk<HolidayCalendar, Partial<HolidayCalendar>, { rejectValue: string }>(
  "leave/createHolidayCalendar",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/holiday-calendar`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to create holiday calendar");
      return data.data || data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const deleteHolidayCalendar = createAsyncThunk<string, string, { rejectValue: string }>(
  "leave/deleteHolidayCalendar",
  async (calendarId, { rejectWithValue }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/holiday-calendar/${calendarId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to delete holiday calendar");
      return calendarId;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const createHoliday = createAsyncThunk<Holiday, Partial<Holiday>, { rejectValue: string }>(
  "leave/createHoliday",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/holiday`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to add holiday");
      return data.data || data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// =============================================
// THUNKS - WORK WEEK
// =============================================
export const fetchWorkWeek = createAsyncThunk<WorkWeek, void, { rejectValue: string }>(
  "leave/fetchWorkWeek",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/work-week`, {
        method: "GET",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch work week");
      return data.data || data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const updateWorkWeek = createAsyncThunk<WorkWeek, WorkWeek, { rejectValue: string }>(
  "leave/updateWorkWeek",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/work-week`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to update work week");
      return data.data || data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// =============================================
// THUNKS - LEAVE APPLY ON BEHALF
// =============================================
export const applyLeaveOnBehalf = createAsyncThunk<LeaveRequest, { userId: string; payload: ApplyLeavePayload }, { rejectValue: string }>(
  "leave/applyOnBehalf",
  async ({ userId, payload }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("leaveTypeId", payload.leaveTypeId);
      formData.append("startDate", payload.startDate);
      formData.append("endDate", payload.endDate);
      formData.append("reason", payload.reason);
      if (payload.attachments) {
        payload.attachments.forEach((f) => formData.append("attachments", f));
      }

      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/apply-on-behalf/${userId}`, {
        method: "POST",
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to apply for leave on behalf");
      return data.data || data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// =============================================
// THUNKS - LEAVE APPLY & MY LEAVE
// =============================================
export const applyForLeave = createAsyncThunk<LeaveRequest, ApplyLeavePayload, { rejectValue: string }>(
  "leave/apply",
  async (payload, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("leaveTypeId", payload.leaveTypeId);
      formData.append("startDate", payload.startDate);
      formData.append("endDate", payload.endDate);
      formData.append("reason", payload.reason);
      if (payload.attachments) {
        payload.attachments.forEach((f) => formData.append("attachments", f));
      }

      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/apply`, {
        method: "POST",
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to apply for leave");
      return data.data || data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const fetchMyBalances = createAsyncThunk<LeaveBalance[], void, { rejectValue: string }>(
  "leave/fetchMyBalances",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/balance/me`, {
        method: "GET",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch leave balances");
      return Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const fetchMyRequests = createAsyncThunk<LeaveRequest[], void, { rejectValue: string }>(
  "leave/fetchMyRequests",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/requests`, {
        method: "GET",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch my leave requests");
      return Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const cancelLeaveRequest = createAsyncThunk<string, { requestId: string; reason?: string }, { rejectValue: string }>(
  "leave/cancel",
  async ({ requestId, reason }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/cancel/${requestId}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to cancel leave request");
      return requestId;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// =============================================
// THUNKS - LEAVE REQUESTS (Admin)
// =============================================
export const fetchLeaveRequests = createAsyncThunk<LeaveRequest[], void, { rejectValue: string }>(
  "leave/fetchRequests",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/requests`, {
        method: "GET",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch leave requests");
      return Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const approveLeaveRequest = createAsyncThunk<string, { requestId: string; remarks?: string }, { rejectValue: string }>(
  "leave/approveRequest",
  async ({ requestId, remarks }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/approve/${requestId}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ remarks }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to approve leave request");
      return requestId;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const rejectLeaveRequest = createAsyncThunk<string, { requestId: string; remarks?: string }, { rejectValue: string }>(
  "leave/rejectRequest",
  async ({ requestId, remarks }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/org/leave/reject/${requestId}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ remarks }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to reject leave request");
      return requestId;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// =============================================
// SLICE
// =============================================
const leaveSlice = createSlice({
  name: "leave",
  initialState,
  reducers: {
    clearLeaveError: (state) => { state.error = null; },
    clearLeaveSuccess: (state) => { state.successMessage = null; },
    setSelectedRequest: (state, action: PayloadAction<LeaveRequest | null>) => { state.selectedRequest = action.payload; },
    setSelectedCalendar: (state, action: PayloadAction<HolidayCalendar | null>) => { state.selectedCalendar = action.payload; },
    // optimistic status update for approve/reject/cancel
    optimisticUpdateRequest: (state, action: PayloadAction<{ id: string; status: LeaveRequestStatus; remarks?: string }>) => {
      const req = state.leaveRequests.find((r) => r.id === action.payload.id);
      if (req) req.status = action.payload.status;
      const myReq = state.myRequests.find((r) => r.id === action.payload.id);
      if (myReq) {
        myReq.status = action.payload.status;
        if (action.payload.remarks) myReq.remarks = action.payload.remarks;
      }
    },
    // add holiday to selected calendar
    addHolidayToCalendar: (state, action: PayloadAction<Holiday>) => {
      if (state.selectedCalendar) {
        if (!state.selectedCalendar.holidays) state.selectedCalendar.holidays = [];
        state.selectedCalendar.holidays.push(action.payload);
      }
      const cal = state.holidayCalendars.find((c) => c.id === action.payload.holidayCalendarId);
      if (cal) {
        if (!cal.holidays) cal.holidays = [];
        cal.holidays.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    // ---- Leave Types ----
    builder.addCase(fetchLeaveTypes.pending, (s) => { s.loading = true; s.error = null; })
    builder.addCase(fetchLeaveTypes.fulfilled, (s, a) => { s.loading = false; s.leaveTypes = a.payload; })
    builder.addCase(fetchLeaveTypes.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })

    builder.addCase(createLeaveType.pending, (s) => { s.submitting = true; s.error = null; })
    builder.addCase(createLeaveType.fulfilled, (s, a) => {
      s.submitting = false;
      const idx = s.leaveTypes.findIndex((t) => t.id === a.payload.id);
      if (idx !== -1) s.leaveTypes[idx] = a.payload; else s.leaveTypes.push(a.payload);
      s.successMessage = "Leave type saved successfully";
    })
    builder.addCase(createLeaveType.rejected, (s, a) => { s.submitting = false; s.error = a.payload as string; })

    builder.addCase(updateLeaveType.pending, (s) => { s.submitting = true; s.error = null; })
    builder.addCase(updateLeaveType.fulfilled, (s, a) => {
      s.submitting = false;
      const idx = s.leaveTypes.findIndex((t) => t.id === a.payload.id);
      if (idx !== -1) s.leaveTypes[idx] = a.payload; else s.leaveTypes.push(a.payload);
      s.successMessage = "Leave type updated successfully";
    })
    builder.addCase(updateLeaveType.rejected, (s, a) => { s.submitting = false; s.error = a.payload as string; })

    // ---- Leave Policies ----
    builder.addCase(fetchLeavePolicies.pending, (s) => { s.loading = true; s.error = null; })
    builder.addCase(fetchLeavePolicies.fulfilled, (s, a) => { s.loading = false; s.leavePolicies = a.payload; })
    builder.addCase(fetchLeavePolicies.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })

    builder.addCase(createLeavePolicy.pending, (s) => { s.submitting = true; s.error = null; })
    builder.addCase(createLeavePolicy.fulfilled, (s, a) => {
      s.submitting = false;
      const idx = s.leavePolicies.findIndex((p) => p.id === a.payload.id);
      if (idx !== -1) s.leavePolicies[idx] = a.payload; else s.leavePolicies.push(a.payload);
      s.successMessage = "Leave policy saved successfully";
    })
    builder.addCase(createLeavePolicy.rejected, (s, a) => { s.submitting = false; s.error = a.payload as string; })

    // ---- Approval Policies ----
    builder.addCase(fetchApprovalPolicies.pending, (s) => { s.loading = true; s.error = null; })
    builder.addCase(fetchApprovalPolicies.fulfilled, (s, a) => { s.loading = false; s.approvalPolicies = a.payload; })
    builder.addCase(fetchApprovalPolicies.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })

    builder.addCase(createApprovalPolicy.pending, (s) => { s.submitting = true; s.error = null; })

    // ---- User Select Options ----
    builder.addCase(fetchUserSelectOptions.fulfilled, (s) => { s.loading = false; });
    builder.addCase(updateUser.pending, (s) => { s.submitting = true; s.error = null; })
    builder.addCase(updateUser.fulfilled, (s) => { s.submitting = false; })
    builder.addCase(updateUser.rejected, (s, a) => { s.submitting = false; s.error = a.payload as string; });
    builder.addCase(createApprovalPolicy.fulfilled, (s, a) => {
      s.submitting = false;
      const idx = s.approvalPolicies.findIndex((p) => p.id === a.payload.id);
      if (idx !== -1) s.approvalPolicies[idx] = a.payload; else s.approvalPolicies.push(a.payload);
      s.successMessage = "Approval policy saved successfully";
    })
    builder.addCase(createApprovalPolicy.rejected, (s, a) => { s.submitting = false; s.error = a.payload as string; })

    // ---- Holiday Calendars ----
    builder.addCase(fetchHolidayCalendars.pending, (s) => { s.loading = true; s.error = null; })
    builder.addCase(fetchHolidayCalendars.fulfilled, (s, a) => { s.loading = false; s.holidayCalendars = a.payload; })
    builder.addCase(fetchHolidayCalendars.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })

    builder.addCase(fetchActiveHolidayCalendar.fulfilled, (s, a) => { s.activeHolidayCalendar = a.payload; })

    builder.addCase(createHolidayCalendar.pending, (s) => { s.submitting = true; s.error = null; })
    builder.addCase(createHolidayCalendar.fulfilled, (s, a) => {
      s.submitting = false;
      const idx = s.holidayCalendars.findIndex((c) => c.id === a.payload.id);
      if (idx !== -1) s.holidayCalendars[idx] = a.payload; else s.holidayCalendars.push(a.payload);
      s.successMessage = "Holiday calendar created successfully";
    })
    builder.addCase(createHolidayCalendar.rejected, (s, a) => { s.submitting = false; s.error = a.payload as string; })

    builder.addCase(deleteHolidayCalendar.pending, (s) => { s.submitting = true; s.error = null; })
    builder.addCase(deleteHolidayCalendar.fulfilled, (s, a) => {
      s.submitting = false;
      s.holidayCalendars = s.holidayCalendars.filter((c) => c.id !== a.payload);
      s.successMessage = "Holiday calendar deleted successfully";
    })
    builder.addCase(deleteHolidayCalendar.rejected, (s, a) => { s.submitting = false; s.error = a.payload as string; })

    builder.addCase(createHoliday.pending, (s) => { s.submitting = true; s.error = null; })
    builder.addCase(createHoliday.fulfilled, (s, a) => {
      s.submitting = false;
      s.successMessage = "Holiday added successfully";
    })
    builder.addCase(createHoliday.rejected, (s, a) => { s.submitting = false; s.error = a.payload as string; })

    // ---- Work Week ----
    builder.addCase(fetchWorkWeek.pending, (s) => { s.loading = true; s.error = null; })
    builder.addCase(fetchWorkWeek.fulfilled, (s, a) => { s.loading = false; s.workWeek = a.payload; })
    builder.addCase(fetchWorkWeek.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })

    builder.addCase(updateWorkWeek.pending, (s) => { s.submitting = true; s.error = null; })
    builder.addCase(updateWorkWeek.fulfilled, (s, a) => { s.submitting = false; s.workWeek = a.payload; s.successMessage = "Work week updated successfully"; })
    builder.addCase(updateWorkWeek.rejected, (s, a) => { s.submitting = false; s.error = a.payload as string; })

    // ---- Apply Leave ----
    builder.addCase(applyForLeave.pending, (s) => { s.submitting = true; s.error = null; })
    builder.addCase(applyForLeave.fulfilled, (s, a) => {
      s.submitting = false;
      s.myRequests.unshift(a.payload);
      s.successMessage = "Leave application submitted successfully";
    })
    builder.addCase(applyForLeave.rejected, (s, a) => { s.submitting = false; s.error = a.payload as string; })

    // ---- My Balances ----
    builder.addCase(fetchMyBalances.pending, (s) => { s.loading = true; s.error = null; })
    builder.addCase(fetchMyBalances.fulfilled, (s, a) => { s.loading = false; s.myBalances = a.payload; })
    builder.addCase(fetchMyBalances.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })

    // ---- My Requests ----
    builder.addCase(fetchMyRequests.pending, (s) => { s.loading = true; s.error = null; })
    builder.addCase(fetchMyRequests.fulfilled, (s, a) => { s.loading = false; s.myRequests = a.payload; })
    builder.addCase(fetchMyRequests.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })

    builder.addCase(cancelLeaveRequest.pending, (s) => { s.actionLoading = "cancelling"; s.error = null; })
    builder.addCase(cancelLeaveRequest.fulfilled, (s, a) => {
      s.actionLoading = null;
      const req = s.myRequests.find((r) => r.id === a.payload);
      if (req) req.status = "CANCELLED";
      s.successMessage = "Leave request cancelled";
    })
    builder.addCase(cancelLeaveRequest.rejected, (s, a) => { s.actionLoading = null; s.error = a.payload as string; })

    // ---- Leave Requests (Admin) ----
    builder.addCase(fetchLeaveRequests.pending, (s) => { s.loading = true; s.error = null; })
    builder.addCase(fetchLeaveRequests.fulfilled, (s, a) => { s.loading = false; s.leaveRequests = a.payload; })
    builder.addCase(fetchLeaveRequests.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })

    builder.addCase(approveLeaveRequest.pending, (s) => { s.actionLoading = "approving"; s.error = null; })
    builder.addCase(approveLeaveRequest.fulfilled, (s, a) => {
      s.actionLoading = null;
      const req = s.leaveRequests.find((r) => r.id === a.payload);
      if (req) req.status = "APPROVED";
      s.successMessage = "Leave request approved";
    })
    builder.addCase(approveLeaveRequest.rejected, (s, a) => { s.actionLoading = null; s.error = a.payload as string; })

    builder.addCase(rejectLeaveRequest.pending, (s) => { s.actionLoading = "rejecting"; s.error = null; })
    builder.addCase(rejectLeaveRequest.fulfilled, (s, a) => {
      s.actionLoading = null;
      const req = s.leaveRequests.find((r) => r.id === a.payload);
      if (req) req.status = "REJECTED";
      s.successMessage = "Leave request rejected";
    })
    builder.addCase(rejectLeaveRequest.rejected, (s, a) => { s.actionLoading = null; s.error = a.payload as string; })
  },
});

export const {
  clearLeaveError,
  clearLeaveSuccess,
  setSelectedRequest,
  setSelectedCalendar,
  optimisticUpdateRequest,
  addHolidayToCalendar,
} = leaveSlice.actions;

export default leaveSlice.reducer;