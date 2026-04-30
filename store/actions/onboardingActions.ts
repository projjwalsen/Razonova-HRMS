import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface InvitationDepartment {
  id: string;
  name: string;
}

export interface InvitationDesignation {
  id: string;
  name: string;
}

export interface Invitation {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  employeeCode?: string;
  joiningDate?: string;
  manager?: any;
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "pending" | "accepted" | "expired";
  department?: InvitationDepartment;
  designation?: InvitationDesignation;
  invitedAt?: string;
  expiresAt?: string;
}

export interface EmployeePayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId?: string;
  designationId?: string;
  designationName?: string;
  managerId?: string;
  roleId?: string;
  employeeCode?: string;
  joiningDate?: string;
  proposedSalary?: number;
  sourceOfHire?: string;
}

export interface OnboardingState {
  invitations: Invitation[];
  pendingInvitations: Invitation[];
  loading: boolean;
  inviting: boolean;
  resending: boolean;
  error: string | null;
}

const initialState: OnboardingState = {
  invitations: [],
  pendingInvitations: [],
  loading: false,
  inviting: false,
  resending: false,
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

// Create employee and send invitation
export const createEmployeeAndInvite = createAsyncThunk<
  Invitation,
  EmployeePayload
>(
  "onboarding/createAndInvite",
  async (payload, { rejectWithValue }) => {
    try {
      const token = getToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/users/onboarding/invite`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to send invitation");
      }

      return data.data || data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Resend invitation
export const resendInvitation = createAsyncThunk<string, string>(
  "onboarding/resend",
  async (inviteId, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue("Authentication token not found. Please login again.");
      }
      console.log("🔁 Resend token check:", token);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/users/onboarding/invite/${inviteId}/resend`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to resend invitation");
      }

      return inviteId;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Get all pending invitations
export const fetchPendingInvitations = createAsyncThunk<Invitation[]>(
  "onboarding/fetchPending",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/users/onboarding/invites/pending`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch pending invitations");
      }

      return data.data || data || [];
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Verify invite (accept invite - first step)
export const verifyInvite = createAsyncThunk<Invitation, string>(
  "onboarding/verifyInvite",
  async (token, { rejectWithValue }) => {
    try {
      console.log("🔑 verifyInvite called with token:", token);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/onboarding/invites/verify?token=${encodeURIComponent(token)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("📥 API Response:", data);

      // Check both HTTP status and API status
      if (!response.ok || data.status === false) {
        console.log("❌ Verification failed:", data.message);
        return rejectWithValue(data.message || "Failed to verify invitation");
      }

      // Store the invite token in localStorage
      if (typeof window !== "undefined") {
        const tokenFromResponse = data.data?.token || token;
        localStorage.setItem("inviteToken", token);
        localStorage.setItem("tempToken", tokenFromResponse);
        console.log("✅ Tokens stored:", { inviteToken: token, tempToken: tokenFromResponse });
      }

      return data.data || data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    clearOnboardingError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create Employee and Invite
    builder.addCase(createEmployeeAndInvite.pending, (state) => {
      state.inviting = true;
      state.error = null;
    });
    builder.addCase(
      createEmployeeAndInvite.fulfilled,
      (state, action: PayloadAction<Invitation>) => {
        state.inviting = false;
        const invitation = {
          ...action.payload,
          status: (action.payload.status as string).toUpperCase() as Invitation["status"],
        };
        state.invitations.push(invitation);
        if (
          invitation.status === "PENDING" ||
          (action.payload.status as string).toUpperCase() === "PENDING"
        ) {
          state.pendingInvitations.push(invitation);
        }
      }
    );
    builder.addCase(createEmployeeAndInvite.rejected, (state, action) => {
      state.inviting = false;
      state.error = action.payload as string;
    });

    // Resend Invitation
    builder.addCase(resendInvitation.pending, (state) => {
      state.resending = true;
      state.error = null;
    });
    builder.addCase(
      resendInvitation.fulfilled,
      (state, action: PayloadAction<string>) => {
        state.resending = false;
        // Update the invitation status to pending in both arrays
        const updateStatus = (inv: Invitation) =>
          inv.id === action.payload
            ? { ...inv, status: "pending" as const }
            : inv;
        state.invitations = state.invitations.map(updateStatus);
        state.pendingInvitations = state.pendingInvitations.map(updateStatus);
      }
    );
    builder.addCase(resendInvitation.rejected, (state, action) => {
      state.resending = false;
      state.error = action.payload as string;
    });

    // Fetch Pending Invitations
    builder.addCase(fetchPendingInvitations.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchPendingInvitations.fulfilled,
      (state, action: PayloadAction<Invitation[]>) => {
        state.loading = false;
        // Normalize status to uppercase and update invitations array
        const normalizedInvitations = action.payload.map((inv) => ({
          ...inv,
          status: (inv.status as string).toUpperCase() as Invitation["status"],
        }));
        state.pendingInvitations = normalizedInvitations;
        // Also update the main invitations array
        normalizedInvitations.forEach((inv) => {
          const existingIndex = state.invitations.findIndex((i) => i.id === inv.id);
          if (existingIndex === -1) {
            state.invitations.push(inv);
          } else {
            state.invitations[existingIndex] = inv;
          }
        });
      }
    );
    builder.addCase(fetchPendingInvitations.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Verify Invite
    builder.addCase(verifyInvite.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      verifyInvite.fulfilled,
      (state, action: PayloadAction<Invitation>) => {
        state.loading = false;
        // Handle case where status might not be present
        const invitation: Invitation = {
          ...action.payload,
          status: action.payload.status
            ? (action.payload.status as string).toUpperCase() as Invitation["status"]
            : "PENDING" as Invitation["status"],
        };
        // Add to invitations array if not exists
        const existingIndex = state.invitations.findIndex((i) => i.id === invitation.id);
        if (existingIndex === -1) {
          state.invitations.push(invitation);
        } else {
          state.invitations[existingIndex] = invitation;
        }
      }
    );
    builder.addCase(verifyInvite.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearOnboardingError } = onboardingSlice.actions;
export default onboardingSlice.reducer;
