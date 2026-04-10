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
  user?: {
    id: string;
    name?: string;
    email?: string;
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
export const checkIn = createAsyncThunk<AttendanceRecord>(
  "attendance/checkIn",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/attendance/check-in`,
        {
          method: "POST",
          headers: getAuthHeaders(),
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
export const checkOut = createAsyncThunk<AttendanceRecord>(
  "attendance/checkOut",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/attendance/check-out`,
        {
          method: "POST",
          headers: getAuthHeaders(),
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
  },
});

export const { clearAttendanceError, clearSelectedUser } = attendanceSlice.actions;
export default attendanceSlice.reducer;
