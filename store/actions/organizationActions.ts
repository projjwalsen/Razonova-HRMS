import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface OrganizationPayload {
  name: string;
  logo?: File | null;
  industry: string;
  companySize: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
}

export interface OrganizationResponse {
  id: string;
  tenantId: string;
  name: string;
  logoUrl?: string | null;
  industry: string;
  companySize: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  message?: string;
}

interface OrganizationState {
  organization: OrganizationResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrganizationState = {
  organization: null,
  loading: false,
  error: null,
};

export const createOrganization = createAsyncThunk<
  OrganizationResponse,
  OrganizationPayload
>(
  "organization/create",
  async (payload, { rejectWithValue, getState }) => {
    try {
      // Get tenantId from localStorage
      let tenantId = "";
      if (typeof window !== "undefined") {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            tenantId = user.tenantId || "";
          } catch {
            tenantId = "";
          }
        }
      }

      const formData = new FormData();
      formData.append("tenantId", tenantId);
      formData.append("name", payload.name);
      if (payload.logo) {
        formData.append("logo", payload.logo);
      }
      formData.append("industry", payload.industry);
      formData.append("companySize", payload.companySize);
      formData.append("addressLine1", payload.addressLine1);
      if (payload.addressLine2) {
        formData.append("addressLine2", payload.addressLine2);
      }
      formData.append("city", payload.city);
      formData.append("state", payload.state);
      formData.append("country", payload.country);
      formData.append("pinCode", payload.pinCode);

      const state = getState() as { auth: { token: string | null } };
      const token = state.auth.token;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/info-create`,
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
        return rejectWithValue(data.message || "Failed to create organization");
      }

      return data.data || data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const updateOrganization = createAsyncThunk<
  OrganizationResponse,
  OrganizationPayload & { id: string }
>(
  "organization/update",
  async (payload, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("name", payload.name);
      if (payload.logo) {
        formData.append("logo", payload.logo);
      }
      formData.append("industry", payload.industry);
      formData.append("companySize", payload.companySize);
      formData.append("addressLine1", payload.addressLine1);
      if (payload.addressLine2) {
        formData.append("addressLine2", payload.addressLine2);
      }
      formData.append("city", payload.city);
      formData.append("state", payload.state);
      formData.append("country", payload.country);
      formData.append("pinCode", payload.pinCode);

      const state = {} as { auth: { token: string | null } };
      if (typeof window !== "undefined") {
        const storedState = localStorage.getItem("token");
        if (storedState) {
          state.auth = { token: storedState };
        }
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/info-update/${payload.id}`,
        {
          method: "PATCH",
          headers: {
            ...(state.auth?.token && { Authorization: `Bearer ${state.auth.token}` }),
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to update organization");
      }

      return data.data || data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const fetchOrganization = createAsyncThunk<OrganizationResponse, string>(
  "organization/fetchById",
  async (id, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const token = state.auth.token;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/info/${id}`,
        {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch organization");
      }

      return data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const fetchOrganizationByTenant = createAsyncThunk<OrganizationResponse | null, void>(
  "organization/fetchByTenant",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string | null; user: { tenantId?: string } | null } };
      const token = state.auth.token;
      const tenantId = state.auth.user?.tenantId;

      if (!tenantId) {
        return null;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/info?tenantId=${tenantId}`,
        {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch organization");
      }

      // Return null if no organization exists yet, otherwise return the data
      return data.data || null;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

const organizationSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {
    clearOrganizationError: (state) => {
      state.error = null;
    },
    resetOrganization: (state) => {
      state.organization = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create Organization
    builder.addCase(createOrganization.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      createOrganization.fulfilled,
      (state, action: PayloadAction<OrganizationResponse>) => {
        state.loading = false;
        state.organization = action.payload;
      }
    );
    builder.addCase(createOrganization.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Organization
    builder.addCase(updateOrganization.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      updateOrganization.fulfilled,
      (state, action: PayloadAction<OrganizationResponse>) => {
        state.loading = false;
        state.organization = action.payload;
      }
    );
    builder.addCase(updateOrganization.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Organization
    builder.addCase(fetchOrganization.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchOrganization.fulfilled,
      (state, action: PayloadAction<OrganizationResponse>) => {
        state.loading = false;
        state.organization = action.payload;
      }
    );
    builder.addCase(fetchOrganization.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Organization by Tenant
    builder.addCase(fetchOrganizationByTenant.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchOrganizationByTenant.fulfilled,
      (state, action: PayloadAction<OrganizationResponse | null>) => {
        state.loading = false;
        state.organization = action.payload;
      }
    );
    builder.addCase(fetchOrganizationByTenant.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearOrganizationError, resetOrganization } =
  organizationSlice.actions;
export default organizationSlice.reducer;
