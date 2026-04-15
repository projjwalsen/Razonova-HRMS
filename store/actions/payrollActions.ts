import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// =============================================
// ENUMS
// =============================================

export type PayrollStatus = 'DRAFT' | 'PROCESSED' | 'DISBURSING' | 'PAID' | 'FAILED' | 'CANCELLED';
export type PayrollItemType = 'EARNING' | 'ALLOWANCE' | 'DEDUCTION' | 'TAX' | 'BONUS';
export type PayStructureValueType = 'FLAT' | 'PERCENTAGE_OF_BASIC';
export type PayrollComponentFreq = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type PayrollComponentType = 'EARNING' | 'ALLOWANCE' | 'DEDUCTION' | 'TAX' | 'BONUS';

// =============================================
// TYPES - PAYROLL COMPONENT MASTER
// =============================================

export interface PayrollComponentMaster {
  id?: string;
  name: string;
  type: PayrollComponentType;
  valueType: PayStructureValueType;
  isTaxable: boolean;
  isOptional: boolean;
  isActive: boolean;
  frequency?: PayrollComponentFreq;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateComponentMasterPayload {
  name: string;
  type: PayrollComponentType;
  valueType: PayStructureValueType;
  isTaxable: boolean;
  isOptional: boolean;
  isActive: boolean;
}

// =============================================
// TYPES - PAY STRUCTURE
// =============================================

export interface PayStructureComponent {
  id?: string;
  payrollMasterComponentId?: string;   // API field
  payrollComponentMasterId?: string;   // alias
  payrollMasterComponent?: PayrollComponentMaster;  // API field
  componentMaster?: PayrollComponentMaster;         // alias
  payStructureId?: string;
  valueType: PayStructureValueType;
  value: number;
  isActive: boolean;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PayStructure {
  id?: string;
  name: string;
  departmentId?: string;
  departmentName?: string;
  designationId?: string;
  designationName?: string;
  isDefault: boolean;
  isActive: boolean;
  components: PayStructureComponent[];
  createdAt?: string;
  updatedAt?: string;
  // API nested objects
  department?: { id: string; name: string };
  designation?: { id: string; name: string };
}

export interface CreatePayStructurePayload {
  name: string;
  departmentId?: string;
  designationId?: string;
  isDefault: boolean;
  isActive: boolean;
  components: PayStructureComponent[];
}

// =============================================
// TYPES - EMPLOYEE PAYROLL COMPONENTS
// =============================================

export interface EmployeePayrollComponent {
  id?: string;
  // API uses payrollMasterComponentId / payrollMasterComponent
  payrollMasterComponentId?: string;
  payrollMasterComponent?: PayrollComponentMaster;
  // Aliases for backward compat
  payrollComponentMasterId?: string;
  componentMaster?: PayrollComponentMaster;
  payStructureId?: string;
  valueType: PayStructureValueType;
  value: number;
  isActive: boolean;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeePayrollOverride {
  userId: string;
  employeeName?: string;
  components: EmployeePayrollComponent[];
}

// Full employee payroll data — includes base structure + overrides + computed salary
export interface EmployeePayrollComponentsDetail {
  userId: string;
  employeeName?: string;
  employeeCode?: string;
  baseSalary?: number;
  grossSalary?: number;
  netSalary?: number;
  payStructure?: PayStructure;
  overrides?: EmployeePayrollComponent[];
  components?: (EmployeePayrollComponent & { componentMaster?: PayrollComponentMaster })[];
}

// =============================================
// TYPES - PAYROLL ITEMS
// =============================================

export interface PayrollItem {
  id?: string;
  label: string;
  type: PayrollItemType;
  amount: number;
  description?: string;
  payrollComponentMasterId?: string;
  isActive?: boolean;
}

// =============================================
// TYPES - DEDUCTION SETTINGS
// =============================================

export interface LeaveDeduction {
  enabled: boolean;
  manualLeaveCount?: number;
  manualAmountDeducted?: number;
}

export interface AttendanceDeduction {
  enabled: boolean;
  manualAbsentCount?: number;
  manualAmountDeducted?: number;
}

// =============================================
// TYPES - PAYROLL GENERATION
// =============================================

export interface GeneratePayrollPayload {
  month: number;
  year: number;
  leaveDeduction?: LeaveDeduction;
  attendanceDeduction?: AttendanceDeduction;
}

export interface GenerateSingleUserPayload {
  userId: string;
  month: number;
  year: number;
  leaveDeduction?: LeaveDeduction;
  attendanceDeduction?: AttendanceDeduction;
}

// =============================================
// TYPES - PAYROLL RECORD
// =============================================

export interface PayrollUserInfo {
  id: string;
  name?: string;
  email?: string;
  employeeCode?: string;
  phone?: string;
  department?: { id: string; name: string };
  designation?: { id: string; name: string };
  manager?: { id: string; name: string };
}

export interface PayrollSummaryDays {
  presentDays: number;
  absentDays: number;
  lateCount: number;
  halfDays: number;
  payableDays: number;
  paidLeaves: number;
  unpaidLeaves: number;
  totalDays?: number;
}

export interface PayrollRecord {
  id: string;
  userId: string;
  month: number;
  year: number;
  status: PayrollStatus;
  baseSalary?: number;
  basicSalary?: number;
  grossSalary?: number;
  netSalary?: number;
  totalEarnings?: number;
  totalAllowances?: number;
  totalDeductions?: number;
  totalBonus?: number;
  totalTax?: number;
  daysSummary?: PayrollSummaryDays;
  items?: PayrollItem[];
  payStructure?: {
    id: string;
    name: string;
  };
  payDate?: string;
  processedAt?: string;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
  // Nested from API
  user?: PayrollUserInfo;
  employeeName?: string;
  employeeEmail?: string;
  department?: string;
  designation?: string;
}

// =============================================
// TYPES - DASHBOARD KPIs
// =============================================

export interface PayrollDashboardKPIs {
  totalPayroll: number;
  processedCount: number;
  pendingCount: number;
  failedCount: number;
  averageSalary: number;
  totalEmployees: number;
  month: number;
  year: number;
  statusBreakdown?: Record<PayrollStatus, number>;
}

// =============================================
// TYPES - LISTING PARAMS
// =============================================

export interface PayrollListingParams {
  month?: number;
  year?: number;
  userId?: string;
  status?: PayrollStatus;
}

// =============================================
// TYPES - PROCESS PAYLOAD
// =============================================

export interface ProcessPayrollPayload {
  items?: PayrollItem[];
}

// =============================================
// REDUX STATE
// =============================================

export interface PayrollState {
  // Dashboard
  dashboardKPIs: PayrollDashboardKPIs | null;
  // Component Masters
  componentMasters: PayrollComponentMaster[];
  // Pay Structures
  payStructures: PayStructure[];
  // Employee Overrides
  employeeOverrides: Record<string, EmployeePayrollComponent[]>;
  overrideEmployeeName: Record<string, string>;
  // Payroll Records
  payrollRecords: PayrollRecord[];
  // Current Detail
  currentPayroll: PayrollRecord | null;
  // My Payslips
  myPayslips: PayrollRecord[];
  myPayslipDetail: PayrollRecord | null;
  // Employee payroll components (for employee self-service view)
  employeePayrollComponents: EmployeePayrollComponentsDetail | null;
  // UI State
  loading: boolean;
  processing: boolean;
  generating: boolean;
  error: string | null;
  successMessage: string | null;
  // Listing filters
  listingFilters: PayrollListingParams;
}

const initialState: PayrollState = {
  dashboardKPIs: null,
  componentMasters: [],
  payStructures: [],
  employeeOverrides: {},
  overrideEmployeeName: {},
  payrollRecords: [],
  currentPayroll: null,
  myPayslips: [],
  myPayslipDetail: null,
  employeePayrollComponents: null,
  loading: false,
  processing: false,
  generating: false,
  error: null,
  successMessage: null,
  listingFilters: {},
};

// =============================================
// HELPERS
// =============================================

const getToken = (): string | null => {
  if (typeof window !== 'undefined') return localStorage.getItem('token');
  return null;
};

const authHeaders = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

const BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/payroll`;

// =============================================
// THUNKS - DASHBOARD
// =============================================

export const fetchDashboardKPIs = createAsyncThunk<
  PayrollDashboardKPIs,
  { month: number; year: number },
  { rejectValue: string }
>('payroll/fetchDashboardKPIs', async ({ month, year }, { rejectWithValue }) => {
  try {
    const res = await fetch(`${BASE}/dashboard-kpis?month=${month}&year=${year}`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.message || 'Failed to fetch dashboard KPIs');
    return data.data || data;
  } catch {
    return rejectWithValue('Network error. Please try again.');
  }
});

// =============================================
// THUNKS - COMPONENT MASTERS
// =============================================

export const fetchComponentMasters = createAsyncThunk<
  PayrollComponentMaster[],
  void,
  { rejectValue: string }
>('payroll/fetchComponentMasters', async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(`${BASE}/component-master`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.message || 'Failed to fetch component masters');
    return data.data || data || [];
  } catch {
    return rejectWithValue('Network error.');
  }
});

export const createComponentMaster = createAsyncThunk<
  PayrollComponentMaster,
  CreateComponentMasterPayload,
  { rejectValue: string }
>('payroll/createComponentMaster', async (payload, { rejectWithValue }) => {
  try {
    const res = await fetch(`${BASE}/component-master`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.message || 'Failed to create component master');
    return data.data || data;
  } catch {
    return rejectWithValue('Network error.');
  }
});

export const updateComponentMaster = createAsyncThunk<
  PayrollComponentMaster,
  { id: string; payload: CreateComponentMasterPayload },
  { rejectValue: string }
>('payroll/updateComponentMaster', async ({ id, payload }, { rejectWithValue }) => {
  try {
    // Backend uses POST for create/update — same endpoint
    const res = await fetch(`${BASE}/component-master`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ ...payload, id }),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.message || 'Failed to update component master');
    return data.data || data;
  } catch {
    return rejectWithValue('Network error.');
  }
});

// =============================================
// THUNKS - PAY STRUCTURES
// =============================================

export const fetchPayStructures = createAsyncThunk<
  PayStructure[],
  void,
  { rejectValue: string }
>('payroll/fetchPayStructures', async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(`${BASE}/pay-structure`, { headers: authHeaders() });
    const json = await res.json();
    if (!res.ok) return rejectWithValue(json.message || 'Failed to fetch pay structures');

    const list = json.data || json || [];
    return list.map((s: any) => ({
      id: s.id,
      name: s.name,
      departmentId: s.departmentId || s.department?.id,
      departmentName: s.departmentName || s.department?.name,
      designationId: s.designationId || s.designation?.id,
      designationName: s.designationName || s.designation?.name,
      isDefault: s.isDefault,
      isActive: s.isActive,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      department: s.department,
      designation: s.designation,
      components: (s.components || []).map((c: any) => ({
        id: c.id,
        payrollMasterComponentId: c.payrollMasterComponentId,
        payrollComponentMasterId: c.payrollMasterComponentId,
        payrollMasterComponent: c.payrollMasterComponent,
        componentMaster: c.payrollMasterComponent,
        payStructureId: c.payStructureId,
        valueType: c.valueType,
        value: c.value,
        isActive: c.isActive,
        remarks: c.remarks,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    }));
  } catch {
    return rejectWithValue('Network error.');
  }
});

export const createPayStructure = createAsyncThunk<
  PayStructure,
  CreatePayStructurePayload,
  { rejectValue: string }
>('payroll/createPayStructure', async (payload, { rejectWithValue }) => {
  try {
    const res = await fetch(`${BASE}/pay-structure`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.message || 'Failed to create pay structure');
    return data.data || data;
  } catch {
    return rejectWithValue('Network error.');
  }
});

export const updatePayStructure = createAsyncThunk<
  PayStructure,
  { id: string; payload: CreatePayStructurePayload },
  { rejectValue: string }
>('payroll/updatePayStructure', async ({ id, payload }, { rejectWithValue }) => {
  try {
    // Route: PUT /pay-structure/:id
    const res = await fetch(`${BASE}/pay-structure/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.message || 'Failed to update pay structure');
    return data.data || data;
  } catch {
    return rejectWithValue('Network error.');
  }
});

// GET /pay-structure/:id
export const fetchPayStructureById = createAsyncThunk<
  PayStructure,
  string,
  { rejectValue: string }
>('payroll/fetchPayStructureById', async (id, { rejectWithValue }) => {
  try {
    const res = await fetch(`${BASE}/pay-structure/${id}`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.message || 'Failed to fetch pay structure');
    return data.data || data;
  } catch {
    return rejectWithValue('Network error.');
  }
});

// DELETE /pay-structure/:id
export const deletePayStructure = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('payroll/deletePayStructure', async (id, { rejectWithValue }) => {
  try {
    const res = await fetch(`${BASE}/pay-structure/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.message || 'Failed to delete pay structure');
    return id;
  } catch {
    return rejectWithValue('Network error.');
  }
});

// =============================================
// THUNKS - EMPLOYEE PAYROLL OVERRIDES
// =============================================

export const fetchEmployeeOverrides = createAsyncThunk<
  { userId: string; components: EmployeePayrollComponent[]; employeeName?: string },
  string,
  { rejectValue: string }
>('payroll/fetchEmployeeOverrides', async (userId, { rejectWithValue }) => {
  try {
    const res = await fetch(`${BASE}/employee-components/${userId}`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.message || 'Failed to fetch employee overrides');
    return { userId, components: data.data || data.components || [], employeeName: data.employeeName };
  } catch {
    return rejectWithValue('Network error.');
  }
});

export const saveEmployeeOverrides = createAsyncThunk<
  { userId: string; components: EmployeePayrollComponent[] },
  { userId: string; components: EmployeePayrollComponent[] },
  { rejectValue: string }
>('payroll/saveEmployeeOverrides', async ({ userId, components }, { rejectWithValue }) => {
  try {
    const res = await fetch(`${BASE}/employee-components/${userId}`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ components }),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.message || 'Failed to save employee overrides');
    return { userId, components: data.data || data.components || [] };
  } catch {
    return rejectWithValue('Network error.');
  }
});

// GET /employee-components/:userId — returns employee's full payroll structure + overrides
export const fetchEmployeePayrollComponents = createAsyncThunk<
  EmployeePayrollComponentsDetail,
  string,
  { rejectValue: string }
>('payroll/fetchEmployeePayrollComponents', async (userId, { rejectWithValue }) => {
  try {
    const res = await fetch(`${BASE}/employee-components/${userId}`, { headers: authHeaders() });
    const json = await res.json();
    if (!res.ok) return rejectWithValue(json.message || 'Failed to fetch employee payroll components');

    const items = json.data || [];
    // Normalize: API uses payrollMasterComponentId / payrollMasterComponent
    const components: EmployeePayrollComponent[] = (Array.isArray(items) ? items : []).map((item: any) => ({
      id: item.id,
      payrollMasterComponentId: item.payrollMasterComponentId,
      payrollMasterComponent: item.payrollMasterComponent,
      payrollComponentMasterId: item.payrollMasterComponentId,
      componentMaster: item.payrollMasterComponent,
      payStructureId: item.payStructureId,
      valueType: item.valueType,
      value: item.value,
      isActive: item.isActive,
      remarks: item.remarks,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return { userId, components };
  } catch {
    return rejectWithValue('Network error.');
  }
});

// =============================================
// THUNKS - PAYROLL GENERATION
// =============================================

export const generatePayroll = createAsyncThunk<
  PayrollRecord[],
  GeneratePayrollPayload,
  { rejectValue: string }
>('payroll/generate', async (payload, { rejectWithValue }) => {
  try {
    const res = await fetch(`${BASE}/generate`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.message || 'Failed to generate payroll');
    return data.data || data || [];
  } catch {
    return rejectWithValue('Network error.');
  }
});

export const generateSingleUserPayroll = createAsyncThunk<
  PayrollRecord,
  GenerateSingleUserPayload,
  { rejectValue: string }
>('payroll/generateSingleUser', async (payload, { rejectWithValue }) => {
  try {
    const res = await fetch(`${BASE}/generate/user`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.message || 'Failed to regenerate payroll');
    return data.data || data;
  } catch {
    return rejectWithValue('Network error.');
  }
});

// =============================================
// THUNKS - PROCESS PAYROLL
// =============================================

export const processPayroll = createAsyncThunk<
  PayrollRecord,
  { payrollId: string; items?: PayrollItem[] },
  { rejectValue: string }
>('payroll/process', async ({ payrollId, items }, { rejectWithValue }) => {
  try {
    const res = await fetch(`${BASE}/process/${payrollId}`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ items: items || [] }),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.message || 'Failed to process payroll');
    return data.data || data;
  } catch {
    return rejectWithValue('Network error.');
  }
});

export const markPayrollDisbursing = createAsyncThunk<
  PayrollRecord,
  string,
  { rejectValue: string }
>('payroll/markDisbursing', async (payrollId, { rejectWithValue }) => {
  try {
    const res = await fetch(`${BASE}/mark-disbursing/${payrollId}`, {
      method: 'POST',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.message || 'Failed to mark as disbursing');
    return data.data || data;
  } catch {
    return rejectWithValue('Network error.');
  }
});

export const markPayrollPaid = createAsyncThunk<
  PayrollRecord,
  string,
  { rejectValue: string }
>('payroll/markPaid', async (payrollId, { rejectWithValue }) => {
  try {
    const res = await fetch(`${BASE}/mark-paid/${payrollId}`, {
      method: 'POST',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.message || 'Failed to mark as paid');
    return data.data || data;
  } catch {
    return rejectWithValue('Network error.');
  }
});

export const markPayrollFailed = createAsyncThunk<
  PayrollRecord,
  string,
  { rejectValue: string }
>('payroll/markFailed', async (payrollId, { rejectWithValue }) => {
  try {
    const res = await fetch(`${BASE}/mark-failed/${payrollId}`, {
      method: 'POST',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.message || 'Failed to mark as failed');
    return data.data || data;
  } catch {
    return rejectWithValue('Network error.');
  }
});

// =============================================
// THUNKS - LISTING
// =============================================

export const fetchAllPayrolls = createAsyncThunk<
  PayrollRecord[],
  PayrollListingParams | void,
  { rejectValue: string }
>('payroll/fetchAll', async (filters, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    if (filters?.month) params.append('month', String(filters.month));
    if (filters?.year) params.append('year', String(filters.year));
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.status) params.append('status', filters.status);
    const query = params.toString();
    const res = await fetch(`${BASE}/all-listing${query ? `?${query}` : ''}`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.message || 'Failed to fetch payrolls');
    return data.data || data || [];
  } catch {
    return rejectWithValue('Network error.');
  }
});

export const fetchPayrollDetail = createAsyncThunk<
  PayrollRecord,
  { payrollId: string; userId?: string },
  { rejectValue: string }
>('payroll/fetchDetail', async ({ payrollId, userId }, { rejectWithValue }) => {
  try {
    // Route: /payroll/:payrollId/:userId
    const url = userId ? `${BASE}/${payrollId}/${userId}` : `${BASE}/${payrollId}`;
    const res = await fetch(url, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.message || 'Failed to fetch payroll detail');
    return data.data || data;
  } catch {
    return rejectWithValue('Network error.');
  }
});

// =============================================
// THUNKS - EMPLOYEE SELF-SERVICE
// =============================================

// GET /employee-components/:userId — Get my payroll lists (uses userId from localStorage)
export const fetchMyPayrolls = createAsyncThunk<
  PayrollRecord[],
  void,
  { rejectValue: string }
>('payroll/fetchMyPayrolls', async (_, { rejectWithValue }) => {
  try {
    const userRaw = localStorage.getItem('user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    const userId = user?.id || user?.userId;
    if (!userId) return rejectWithValue('User ID not found');

    const res = await fetch(`${BASE}/employee-components/${userId}`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.message || 'Failed to fetch my payrolls');
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  } catch {
    return rejectWithValue('Network error.');
  }
});

// GET /payroll/:payrollId — Fetch my payroll detail (reuses fetchPayrollDetail with current userId)
export const fetchMyPayrollDetail = createAsyncThunk<
  PayrollRecord,
  string,
  { rejectValue: string }
>('payroll/fetchMyPayrollDetail', async (payrollId, { rejectWithValue }) => {
  try {
    const userRaw = localStorage.getItem('user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    const userId = user?.id || user?.userId;
    const url = userId ? `${BASE}/${payrollId}/${userId}` : `${BASE}/${payrollId}`;
    const res = await fetch(url, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.message || 'Failed to fetch payroll detail');
    return data.data || data;
  } catch {
    return rejectWithValue('Network error.');
  }
});

// =============================================
// SLICE
// =============================================

const payrollSlice = createSlice({
  name: 'payroll',
  initialState,
  reducers: {
    clearPayrollError: (state) => { state.error = null; },
    clearPayrollSuccess: (state) => { state.successMessage = null; },
    setListingFilters: (state, action: PayloadAction<PayrollListingParams>) => {
      state.listingFilters = action.payload;
    },
    clearListingFilters: (state) => { state.listingFilters = {}; },
    setCurrentPayroll: (state, action: PayloadAction<PayrollRecord | null>) => {
      state.currentPayroll = action.payload;
    },
    clearMyPayslipDetail: (state) => { state.myPayslipDetail = null; },
  },
  extraReducers: (builder) => {
    // ── Dashboard KPIs ──────────────────────────────────────────
    builder.addCase(fetchDashboardKPIs.pending, (s) => { s.loading = true; s.error = null; });
    builder.addCase(fetchDashboardKPIs.fulfilled, (s, a) => { s.loading = false; s.dashboardKPIs = a.payload; });
    builder.addCase(fetchDashboardKPIs.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; });

    // ── Component Masters ───────────────────────────────────────
    builder.addCase(fetchComponentMasters.pending, (s) => { s.loading = true; s.error = null; });
    builder.addCase(fetchComponentMasters.fulfilled, (s, a) => { s.loading = false; s.componentMasters = a.payload; });
    builder.addCase(fetchComponentMasters.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; });

    builder.addCase(createComponentMaster.pending, (s) => { s.loading = true; s.error = null; });
    builder.addCase(createComponentMaster.fulfilled, (s, a) => {
      s.loading = false;
      const idx = s.componentMasters.findIndex((c) => c.id === a.payload.id);
      if (idx !== -1) s.componentMasters[idx] = a.payload;
      else s.componentMasters.push(a.payload);
      s.successMessage = 'Component master saved successfully';
    });
    builder.addCase(createComponentMaster.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; });

    builder.addCase(updateComponentMaster.pending, (s) => { s.loading = true; s.error = null; });
    builder.addCase(updateComponentMaster.fulfilled, (s, a) => {
      s.loading = false;
      const idx = s.componentMasters.findIndex((c) => c.id === a.payload.id);
      if (idx !== -1) s.componentMasters[idx] = a.payload;
      s.successMessage = 'Component master updated successfully';
    });
    builder.addCase(updateComponentMaster.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; });

    // ── Pay Structures ───────────────────────────────────────────
    builder.addCase(fetchPayStructures.pending, (s) => { s.loading = true; s.error = null; });
    builder.addCase(fetchPayStructures.fulfilled, (s, a) => { s.loading = false; s.payStructures = a.payload; });
    builder.addCase(fetchPayStructures.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; });

    builder.addCase(createPayStructure.pending, (s) => { s.loading = true; s.error = null; });
    builder.addCase(createPayStructure.fulfilled, (s, a) => {
      s.loading = false;
      const idx = s.payStructures.findIndex((p) => p.id === a.payload.id);
      if (idx !== -1) s.payStructures[idx] = a.payload;
      else s.payStructures.push(a.payload);
      s.successMessage = 'Pay structure saved successfully';
    });
    builder.addCase(createPayStructure.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; });

    builder.addCase(updatePayStructure.pending, (s) => { s.loading = true; s.error = null; });
    builder.addCase(updatePayStructure.fulfilled, (s, a) => {
      s.loading = false;
      const idx = s.payStructures.findIndex((p) => p.id === a.payload.id);
      if (idx !== -1) s.payStructures[idx] = a.payload;
      s.successMessage = 'Pay structure updated successfully';
    });
    builder.addCase(updatePayStructure.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; });

    // ── Employee Overrides ───────────────────────────────────────
    builder.addCase(fetchEmployeeOverrides.pending, (s) => { s.loading = true; s.error = null; });
    builder.addCase(fetchEmployeeOverrides.fulfilled, (s, a) => {
      s.loading = false;
      s.employeeOverrides[a.payload.userId] = a.payload.components;
      if (a.payload.employeeName) s.overrideEmployeeName[a.payload.userId] = a.payload.employeeName;
    });
    builder.addCase(fetchEmployeeOverrides.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; });

    builder.addCase(saveEmployeeOverrides.pending, (s) => { s.loading = true; s.error = null; });
    builder.addCase(saveEmployeeOverrides.fulfilled, (s, a) => {
      s.loading = false;
      s.employeeOverrides[a.payload.userId] = a.payload.components;
      s.successMessage = 'Employee overrides saved successfully';
    });
    builder.addCase(saveEmployeeOverrides.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; });

    // fetchPayStructureById
    builder.addCase(fetchPayStructureById.pending, (s) => { s.loading = true; s.error = null; });
    builder.addCase(fetchPayStructureById.fulfilled, (s) => { s.loading = false; });
    builder.addCase(fetchPayStructureById.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; });

    // deletePayStructure
    builder.addCase(deletePayStructure.pending, (s) => { s.loading = true; s.error = null; });
    builder.addCase(deletePayStructure.fulfilled, (s, a) => {
      s.loading = false;
      s.payStructures = s.payStructures.filter((p) => p.id !== a.payload);
      s.successMessage = 'Pay structure deleted successfully';
    });
    builder.addCase(deletePayStructure.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; });

    // ── Employee Payroll Components (self-service) ─────────────────
    builder.addCase(fetchEmployeePayrollComponents.pending, (s) => { s.loading = true; s.error = null; });
    builder.addCase(fetchEmployeePayrollComponents.fulfilled, (s, a) => { s.loading = false; s.employeePayrollComponents = a.payload; });
    builder.addCase(fetchEmployeePayrollComponents.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; });

    // ── Generate Payroll ─────────────────────────────────────────
    builder.addCase(generatePayroll.pending, (s) => { s.generating = true; s.error = null; });
    builder.addCase(generatePayroll.fulfilled, (s, a) => {
      s.generating = false;
      a.payload.forEach((p) => {
        const idx = s.payrollRecords.findIndex((r) => r.id === p.id);
        if (idx !== -1) s.payrollRecords[idx] = p;
        else s.payrollRecords.unshift(p);
      });
      s.successMessage = `Payroll generated for ${a.payload.length} employee(s)`;
    });
    builder.addCase(generatePayroll.rejected, (s, a) => { s.generating = false; s.error = a.payload as string; });

    builder.addCase(generateSingleUserPayroll.pending, (s) => { s.processing = true; s.error = null; });
    builder.addCase(generateSingleUserPayroll.fulfilled, (s, a) => {
      s.processing = false;
      const idx = s.payrollRecords.findIndex((r) => r.id === a.payload.id);
      if (idx !== -1) s.payrollRecords[idx] = a.payload;
      if (s.currentPayroll?.id === a.payload.id) s.currentPayroll = a.payload;
      s.successMessage = 'Employee payroll updated successfully';
    });
    builder.addCase(generateSingleUserPayroll.rejected, (s, a) => { s.processing = false; s.error = a.payload as string; });

    // ── Process / Status Updates ──────────────────────────────────
    builder.addCase(processPayroll.pending, (s) => { s.processing = true; s.error = null; });
    builder.addCase(processPayroll.fulfilled, (s, a) => {
      s.processing = false;
      const idx = s.payrollRecords.findIndex((r) => r.id === a.payload.id);
      if (idx !== -1) s.payrollRecords[idx] = a.payload;
      if (s.currentPayroll?.id === a.payload.id) s.currentPayroll = a.payload;
      s.successMessage = 'Payroll processed successfully';
    });
    builder.addCase(processPayroll.rejected, (s, a) => { s.processing = false; s.error = a.payload as string; });

    builder.addCase(markPayrollDisbursing.pending, (s) => { s.processing = true; s.error = null; });
    builder.addCase(markPayrollDisbursing.fulfilled, (s, a) => {
      s.processing = false;
      const idx = s.payrollRecords.findIndex((r) => r.id === a.payload.id);
      if (idx !== -1) s.payrollRecords[idx] = a.payload;
      if (s.currentPayroll?.id === a.payload.id) s.currentPayroll = a.payload;
      s.successMessage = 'Payroll marked as disbursing';
    });
    builder.addCase(markPayrollDisbursing.rejected, (s, a) => { s.processing = false; s.error = a.payload as string; });

    builder.addCase(markPayrollPaid.pending, (s) => { s.processing = true; s.error = null; });
    builder.addCase(markPayrollPaid.fulfilled, (s, a) => {
      s.processing = false;
      const idx = s.payrollRecords.findIndex((r) => r.id === a.payload.id);
      if (idx !== -1) s.payrollRecords[idx] = a.payload;
      if (s.currentPayroll?.id === a.payload.id) s.currentPayroll = a.payload;
      s.successMessage = 'Payroll marked as paid';
    });
    builder.addCase(markPayrollPaid.rejected, (s, a) => { s.processing = false; s.error = a.payload as string; });

    builder.addCase(markPayrollFailed.pending, (s) => { s.processing = true; s.error = null; });
    builder.addCase(markPayrollFailed.fulfilled, (s, a) => {
      s.processing = false;
      const idx = s.payrollRecords.findIndex((r) => r.id === a.payload.id);
      if (idx !== -1) s.payrollRecords[idx] = a.payload;
      if (s.currentPayroll?.id === a.payload.id) s.currentPayroll = a.payload;
      s.successMessage = 'Payroll marked as failed';
    });
    builder.addCase(markPayrollFailed.rejected, (s, a) => { s.processing = false; s.error = a.payload as string; });

    // ── Fetch All / Detail ───────────────────────────────────────
    builder.addCase(fetchAllPayrolls.pending, (s) => { s.loading = true; s.error = null; });
    builder.addCase(fetchAllPayrolls.fulfilled, (s, a) => { s.loading = false; s.payrollRecords = a.payload; });
    builder.addCase(fetchAllPayrolls.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; });

    builder.addCase(fetchPayrollDetail.pending, (s) => { s.loading = true; s.error = null; });
    builder.addCase(fetchPayrollDetail.fulfilled, (s, a) => { s.loading = false; s.currentPayroll = a.payload; });
    builder.addCase(fetchPayrollDetail.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; });

    // ── Employee Self-Service ────────────────────────────────────
    builder.addCase(fetchMyPayrolls.pending, (s) => { s.loading = true; s.error = null; });
    builder.addCase(fetchMyPayrolls.fulfilled, (s, a) => { s.loading = false; s.myPayslips = a.payload; });
    builder.addCase(fetchMyPayrolls.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; });

    builder.addCase(fetchMyPayrollDetail.pending, (s) => { s.loading = true; s.error = null; });
    builder.addCase(fetchMyPayrollDetail.fulfilled, (s, a) => { s.loading = false; s.myPayslipDetail = a.payload; });
    builder.addCase(fetchMyPayrollDetail.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; });
  },
});

export const {
  clearPayrollError,
  clearPayrollSuccess,
  setListingFilters,
  clearListingFilters,
  setCurrentPayroll,
  clearMyPayslipDetail,
} = payrollSlice.actions;

export default payrollSlice.reducer;
