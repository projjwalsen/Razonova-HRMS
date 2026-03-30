import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Designation {
  id: string;
  name: string;
  departmentId: string;
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DesignationState {
  designations: Designation[];
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  error: string | null;
}

const initialState: DesignationState = {
  designations: [],
  loading: false,
  saving: false,
  deleting: false,
  error: null,
};

export const fetchDesignations = createAsyncThunk<Designation[], void>(
  "designations/fetchAll",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const token = state.auth.token;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/designations`,
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
        return rejectWithValue(data.message || "Failed to fetch designations");
      }

      return data.data || data || [];
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const createDesignation = createAsyncThunk<
  Designation,
  { name: string; departmentId: string }
>(
  "designations/create",
  async (payload, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const token = state.auth.token;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/designation/create`,
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
        return rejectWithValue(data.message || "Failed to create designation");
      }

      return data.data || data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const updateDesignation = createAsyncThunk<
  Designation,
  { id: string; name: string; departmentId: string; }
>(
  "designations/update",
  async (payload, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const token = state.auth.token;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/designation/update/${payload.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            name: payload.name,
            departmentId: payload.departmentId,
            
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to update designation");
      }

      return data.data || data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const deleteDesignation = createAsyncThunk<string, string>(
  "designations/delete",
  async (id, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const token = state.auth.token;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/designation/delete/${id}`,
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
        return rejectWithValue(data.message || "Failed to delete designation");
      }

      return id;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

const designationSlice = createSlice({
  name: "designations",
  initialState,
  reducers: {
    clearDesignationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch All
    builder.addCase(fetchDesignations.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchDesignations.fulfilled,
      (state, action: PayloadAction<Designation[]>) => {
        state.loading = false;
        state.designations = action.payload;
      }
    );
    builder.addCase(fetchDesignations.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create
    builder.addCase(createDesignation.pending, (state) => {
      state.saving = true;
      state.error = null;
    });
    builder.addCase(
      createDesignation.fulfilled,
      (state, action: PayloadAction<Designation>) => {
        state.saving = false;
        state.designations.push(action.payload);
      }
    );
    builder.addCase(createDesignation.rejected, (state, action) => {
      state.saving = false;
      state.error = action.payload as string;
    });

    // Update
    builder.addCase(updateDesignation.pending, (state) => {
      state.saving = true;
      state.error = null;
    });
    builder.addCase(
      updateDesignation.fulfilled,
      (state, action: PayloadAction<Designation>) => {
        state.saving = false;
        const index = state.designations.findIndex(
          (d) => d.id === action.payload.id
        );
        if (index !== -1) {
          state.designations[index] = action.payload;
        }
      }
    );
    builder.addCase(updateDesignation.rejected, (state, action) => {
      state.saving = false;
      state.error = action.payload as string;
    });

    // Delete
    builder.addCase(deleteDesignation.pending, (state) => {
      state.deleting = true;
      state.error = null;
    });
    builder.addCase(
      deleteDesignation.fulfilled,
      (state, action: PayloadAction<string>) => {
        state.deleting = false;
        state.designations = state.designations.filter(
          (d) => d.id !== action.payload
        );
      }
    );
    builder.addCase(deleteDesignation.rejected, (state, action) => {
      state.deleting = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearDesignationError } = designationSlice.actions;
export default designationSlice.reducer;
