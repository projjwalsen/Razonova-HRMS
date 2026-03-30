import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Department {
  id: string;
  name: string;
  head?: string;
  employeeCount?: number;
  budget?: string;
  location?: string;
  description?: string;
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentState {
  departments: Department[];
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  error: string | null;
}

const initialState: DepartmentState = {
  departments: [],
  loading: false,
  saving: false,
  deleting: false,
  error: null,
};

export const fetchDepartments = createAsyncThunk<Department[], void>(
  "departments/fetchAll",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const token = state.auth.token;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/departments`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch departments");
      }

      return data.data || data || [];
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const createDepartment = createAsyncThunk<Department, { name: string }>(
  "departments/create",
  async (payload, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const token = state.auth.token;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/department/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to create department");
      }

      return data.data || data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const updateDepartment = createAsyncThunk<Department, { id: string; name: string }>(
  "departments/update",
  async (payload, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const token = state.auth.token;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/department/update/${payload.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ name: payload.name }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to update department");
      }

      return data.data || data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const deleteDepartment = createAsyncThunk<string, string>(
  "departments/delete",
  async (id, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const token = state.auth.token;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/department/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to delete department");
      }

      return id;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

const departmentSlice = createSlice({
  name: "departments",
  initialState,
  reducers: {
    clearDepartmentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch All
    builder.addCase(fetchDepartments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchDepartments.fulfilled,
      (state, action: PayloadAction<Department[]>) => {
        state.loading = false;
        state.departments = action.payload;
      }
    );
    builder.addCase(fetchDepartments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create
    builder.addCase(createDepartment.pending, (state) => {
      state.saving = true;
      state.error = null;
    });
    builder.addCase(
      createDepartment.fulfilled,
      (state, action: PayloadAction<Department>) => {
        state.saving = false;
        state.departments.push(action.payload);
      }
    );
    builder.addCase(createDepartment.rejected, (state, action) => {
      state.saving = false;
      state.error = action.payload as string;
    });

    // Update
    builder.addCase(updateDepartment.pending, (state) => {
      state.saving = true;
      state.error = null;
    });
    builder.addCase(
      updateDepartment.fulfilled,
      (state, action: PayloadAction<Department>) => {
        state.saving = false;
        const index = state.departments.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) {
          state.departments[index] = action.payload;
        }
      }
    );
    builder.addCase(updateDepartment.rejected, (state, action) => {
      state.saving = false;
      state.error = action.payload as string;
    });

    // Delete
    builder.addCase(deleteDepartment.pending, (state) => {
      state.deleting = true;
      state.error = null;
    });
    builder.addCase(deleteDepartment.fulfilled, (state, action: PayloadAction<string>) => {
      state.deleting = false;
      state.departments = state.departments.filter((d) => d.id !== action.payload);
    });
    builder.addCase(deleteDepartment.rejected, (state, action) => {
      state.deleting = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearDepartmentError } = departmentSlice.actions;
export default departmentSlice.reducer;
