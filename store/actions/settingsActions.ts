import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface GeneralSettings {
  country: string;
  timezone: string;
  timeFormat: string;
  nameFormat: string;
  dateFormat: string;
}

export interface SettingItem {
  id: string;
  tenantId: string;
  key: string;
  value: GeneralSettings;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationSettings {
  settings: SettingItem[];
}

export interface SettingsState {
  settings: OrganizationSettings | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: null,
  loading: false,
  saving: false,
  error: null,
};

export const fetchSettings = createAsyncThunk<OrganizationSettings, void>(
  "settings/fetch",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string | null; user: { tenantId?: string } | null } };
      const token = state.auth.token;
      const tenantId = state.auth.user?.tenantId;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/settings`,
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
        return rejectWithValue(data.message || "Failed to fetch settings");
      }

      // Response: { status, message, data: [...] }
      return { settings: data.data || [] };
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const saveSettings = createAsyncThunk<OrganizationSettings, GeneralSettings>(
  "settings/save",
  async (settings, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string | null; user: { tenantId?: string } | null } };
      const token = state.auth.token;
      const tenantId = state.auth.user?.tenantId;

      const payload = {
        tenantId,
        settings: [
          {
            key: "general",
            value: settings,
          },
        ],
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/settings-create`,
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
        return rejectWithValue(data.message || "Failed to save settings");
      }

      // Response: { status, message, data: [...] }
      return { settings: data.data || [] };
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    clearSettingsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Settings
    builder.addCase(fetchSettings.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchSettings.fulfilled,
      (state, action: PayloadAction<OrganizationSettings>) => {
        state.loading = false;
        state.settings = action.payload;
      }
    );
    builder.addCase(fetchSettings.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Save Settings
    builder.addCase(saveSettings.pending, (state) => {
      state.saving = true;
      state.error = null;
    });
    builder.addCase(
      saveSettings.fulfilled,
      (state, action: PayloadAction<OrganizationSettings>) => {
        state.saving = false;
        state.settings = action.payload;
      }
    );
    builder.addCase(saveSettings.rejected, (state, action) => {
      state.saving = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearSettingsError } = settingsSlice.actions;
export default settingsSlice.reducer;
