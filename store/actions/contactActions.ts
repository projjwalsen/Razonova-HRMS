import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface ContactPayload {
  email: string;
  phone: string;
  companyName: string;
  query: string;
}

export interface ContactState {
  submitting: boolean;
  submitted: boolean;
  error: string | null;
}

const initialState: ContactState = {
  submitting: false,
  submitted: false,
  error: null,
};

export const submitContactQuery = createAsyncThunk<void, ContactPayload>(
  "contact/submit",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/contact-us`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || "Failed to submit query");
      }

      return;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

const contactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {
    clearContactError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitContactQuery.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.submitted = false;
      })
      .addCase(submitContactQuery.fulfilled, (state) => {
        state.submitting = false;
        state.submitted = true;
      })
      .addCase(submitContactQuery.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearContactError } = contactSlice.actions;
export default contactSlice.reducer;
