import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// Pay Structure Component
export interface PayStructureComponent {
  id?: string;
  label: string;
  componentType?: "BASIC" | "HRA" | "DA" | "ALLOWANCE" | "DEDUCTION" | "BONUS" | "OTHER";
  type?: string;
  valueType: "FLAT" | "PERCENTAGE";
  value: number;
  isTaxable: boolean;
  attachmentRequired?: boolean;
}

// Pay Structure
export interface PayStructure {
  id?: string;
  name: string;
  departmentId?: string;
  departmentName?: string;
  designationId?: string;
  designationName?: string;
  isDefault: boolean;
  components: PayStructureComponent[];
  createdAt?: string;
  updatedAt?: string;
}

// Transform PayStructure API response
const transformPayStructure = (record: any): PayStructure => {
  return {
    ...record,
    components: record.components || [],
  };
};

// Payroll Item (earnings/deductions for processed payroll)
export interface PayrollItem {
  label: string;
  type: "EARNING" | "DEDUCTION";
  amount: number;
  description?: string;
}

// Payroll Record
export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  designation?: string;
  month: number;
  year: number;
  basicSalary: number;
  grossSalary: number;
  netSalary: number;
  totalEarnings: number;
  totalDeductions: number;
  totalAllowances?: number;
  totalBonus?: number;
  totalTax?: number;
  presentDays?: number;
  absentDays?: number;
  status: "DRAFT" | "PROCESSED" | "PAID" | "CANCELLED";
  payDate?: string;
  processedAt?: string;
  paidAt?: string;
  items?: PayrollItem[];
  components?: any[];
  createdAt?: string;
  updatedAt?: string;
  // Nested objects from API
  user?: {
    id: string;
    name?: string;
    email?: string;
    employeeProfile?: {
      employeeCode?: string;
      salary?: number;
    };
    department?: {
      name?: string;
    };
    designation?: {
      name?: string;
    };
  };
  payStructure?: {
    id: string;
    name?: string;
    components?: any[];
  };
}

// Transform API response to PayrollRecord
const transformPayrollRecord = (record: any): PayrollRecord => {
  return {
    ...record,
    employeeId: record.user?.id || record.userId,
    employeeName: record.user?.name || record.user?.employeeProfile?.employeeCode || 'Unknown',
    employeeEmail: record.user?.email || '',
    department: record.user?.department?.name || record.department || 'N/A',
    designation: record.user?.designation?.name || '',
    basicSalary: record.baseSalary || record.basicSalary || 0,
    items: record.items || [],
  };
};

// My Payslip (simplified for employee's view)
export interface Payslip {
  id: string;
  employeeId?: string;
  employeeName?: string;
  employeeEmail?: string;
  department?: string;
  month: number;
  year: number;
  monthName?: string;
  payDate?: string;
  basicSalary: number;
  grossSalary?: number;
  netSalary: number;
  totalEarnings?: number;
  totalDeductions?: number;
  allowances?: number;
  deductions?: number;
  status: "DRAFT" | "PROCESSED" | "PAID";
  items?: PayrollItem[];
  components?: any[];
  createdAt?: string;
}

// Payroll Summary
export interface PayrollSummary {
  totalPayroll: number;
  totalEmployees: number;
  processedCount: number;
  pendingCount: number;
  averageSalary: number;
}

export interface PayrollState {
  payStructures: PayStructure[];
  payrollRecords: PayrollRecord[];
  myPayslips: Payslip[];
  currentPayroll: PayrollRecord | null;
  payrollSummary: PayrollSummary | null;
  loading: boolean;
  processing: boolean;
  generating: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: PayrollState = {
  payStructures: [],
  payrollRecords: [],
  myPayslips: [],
  currentPayroll: null,
  payrollSummary: null,
  loading: false,
  processing: false,
  generating: false,
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

// Fetch Pay Structure
export const fetchPayStructure = createAsyncThunk<PayStructure[]>(
  "payroll/fetchStructure",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/payroll/pay-structure`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch pay structure");
      }

      const records = data.data || data || [];
      return Array.isArray(records) ? records.map(transformPayStructure) : [];
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Save Pay Structure
export const savePayStructure = createAsyncThunk<PayStructure, PayStructure>(
  "payroll/saveStructure",
  async (structure, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/payroll/pay-structure`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(structure),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to save pay structure");
      }

      return data.data || data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Fetch All Payroll Listings
export const fetchAllPayrolls = createAsyncThunk<PayrollRecord[]>(
  "payroll/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/payroll/all-listing`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch payrolls");
      }

      const records = data.data || data || [];
      return Array.isArray(records) ? records.map(transformPayrollRecord) : [];
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Generate Payroll
export interface GeneratePayrollPayload {
  month: number;
  year: number;
}

export const generatePayroll = createAsyncThunk<PayrollRecord[], GeneratePayrollPayload>(
  "payroll/generate",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/payroll/generate`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to generate payroll");
      }

      const records = data.data || data || [];
      return Array.isArray(records) ? records.map(transformPayrollRecord) : [];
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Process Payroll
export interface ProcessPayrollPayload {
  items: PayrollItem[];
}

export const processPayroll = createAsyncThunk<PayrollRecord, { payrollId: string; items: PayrollItem[] }>(
  "payroll/process",
  async ({ payrollId, items }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/payroll/process/${payrollId}`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ items }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to process payroll");
      }

      return transformPayrollRecord(data.data || data);
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Fetch My Payslips
export const fetchMyPayslips = createAsyncThunk<Payslip[]>(
  "payroll/fetchMyPayslips",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/payroll/my-payslips`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch payslips");
      }

      // Transform records to Payslip format
      const records = data.data || data || [];
      if (!Array.isArray(records)) return [];
      return records.map((record: any): Payslip => ({
        id: record.id,
        employeeId: record.user?.id || record.userId,
        employeeName: record.user?.name || '',
        employeeEmail: record.user?.email || '',
        department: record.user?.department?.name || '',
        month: record.month,
        year: record.year,
        basicSalary: record.baseSalary || record.basicSalary || 0,
        grossSalary: record.grossSalary,
        netSalary: record.netSalary || 0,
        totalEarnings: record.totalEarnings,
        totalDeductions: record.totalDeductions,
        allowances: record.totalAllowances,
        deductions: record.totalDeductions,
        status: record.status,
        payDate: record.paidAt || record.processedAt,
        items: record.items || [],
        createdAt: record.createdAt,
      }));
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Download Payslip
export const downloadPayslip = createAsyncThunk<string, string>(
  "payroll/downloadPayslip",
  async (payslipId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/payroll/payslip/${payslipId}/download`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        return rejectWithValue("Failed to download payslip");
      }

      // Return download URL or blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      return url;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

const payrollSlice = createSlice({
  name: "payroll",
  initialState,
  reducers: {
    clearPayrollError: (state) => {
      state.error = null;
    },
    clearPayrollSuccess: (state) => {
      state.successMessage = null;
    },
    setCurrentPayroll: (state, action: PayloadAction<PayrollRecord | null>) => {
      state.currentPayroll = action.payload;
    },
    updatePayrollItem: (state, action: PayloadAction<{ index: number; item: PayrollItem }>) => {
      if (state.currentPayroll && state.currentPayroll.items) {
        state.currentPayroll.items[action.payload.index] = action.payload.item;
      }
    },
    addPayrollItem: (state, action: PayloadAction<PayrollItem>) => {
      if (state.currentPayroll) {
        if (!state.currentPayroll.items) {
          state.currentPayroll.items = [];
        }
        state.currentPayroll.items.push(action.payload);
      }
    },
    removePayrollItem: (state, action: PayloadAction<number>) => {
      if (state.currentPayroll && state.currentPayroll.items) {
        state.currentPayroll.items.splice(action.payload, 1);
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Pay Structure
    builder.addCase(fetchPayStructure.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPayStructure.fulfilled, (state, action: PayloadAction<PayStructure[]>) => {
      state.loading = false;
      state.payStructures = action.payload;
    });
    builder.addCase(fetchPayStructure.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Save Pay Structure
    builder.addCase(savePayStructure.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(savePayStructure.fulfilled, (state, action: PayloadAction<PayStructure>) => {
      state.loading = false;
      const index = state.payStructures.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.payStructures[index] = action.payload;
      } else {
        state.payStructures.push(action.payload);
      }
      state.successMessage = "Pay structure saved successfully";
    });
    builder.addCase(savePayStructure.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch All Payrolls
    builder.addCase(fetchAllPayrolls.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAllPayrolls.fulfilled, (state, action: PayloadAction<PayrollRecord[]>) => {
      state.loading = false;
      state.payrollRecords = action.payload;
    });
    builder.addCase(fetchAllPayrolls.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Generate Payroll
    builder.addCase(generatePayroll.pending, (state) => {
      state.generating = true;
      state.error = null;
    });
    builder.addCase(generatePayroll.fulfilled, (state, action: PayloadAction<PayrollRecord[]>) => {
      state.generating = false;
      // Add generated payrolls to records
      action.payload.forEach((payroll) => {
        const existingIndex = state.payrollRecords.findIndex((p) => p.id === payroll.id);
        if (existingIndex !== -1) {
          state.payrollRecords[existingIndex] = payroll;
        } else {
          state.payrollRecords.push(payroll);
        }
      });
      state.successMessage = "Payroll generated successfully";
    });
    builder.addCase(generatePayroll.rejected, (state, action) => {
      state.generating = false;
      state.error = action.payload as string;
    });

    // Process Payroll
    builder.addCase(processPayroll.pending, (state) => {
      state.processing = true;
      state.error = null;
    });
    builder.addCase(processPayroll.fulfilled, (state, action: PayloadAction<PayrollRecord>) => {
      state.processing = false;
      const index = state.payrollRecords.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.payrollRecords[index] = action.payload;
      }
      state.currentPayroll = null;
      state.successMessage = "Payroll processed successfully";
    });
    builder.addCase(processPayroll.rejected, (state, action) => {
      state.processing = false;
      state.error = action.payload as string;
    });

    // Fetch My Payslips
    builder.addCase(fetchMyPayslips.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMyPayslips.fulfilled, (state, action: PayloadAction<Payslip[]>) => {
      state.loading = false;
      state.myPayslips = action.payload;
    });
    builder.addCase(fetchMyPayslips.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  clearPayrollError,
  clearPayrollSuccess,
  setCurrentPayroll,
  updatePayrollItem,
  addPayrollItem,
  removePayrollItem,
} = payrollSlice.actions;

export default payrollSlice.reducer;
