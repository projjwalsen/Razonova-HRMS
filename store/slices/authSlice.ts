import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  signup,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  User,
  CurrentAccess,
  RoleSummary,
  PermissionItem,
  SelectOption,
} from "../actions/authActions";
import {
  fetchMyAccess,
  fetchAllRoles,
  fetchAllPermissions,
  assignPermissionsToRole,
  assignRoleToUser,
  unassignRoleFromUser,
  transferRole,
  fetchUserSelectOptions,
  fetchAssignedUsers,
  createRole,
} from "../actions/authActions";

// =============================================
// SLICE
// =============================================

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  forgotEmail: string | null;
  otpSent: boolean;
  otpVerified: boolean;
  forgotLoading: boolean;
  otpLoading: boolean;
  resetLoading: boolean;
  forgotError: string | null;
  otpError: string | null;
  resetError: string | null;
  forgotSuccess: string | null;
  otpSuccess: string | null;
  resetSuccess: string | null;
  // RBAC
  access: CurrentAccess | null;
  allRoles: RoleSummary[];
  allPermissions: PermissionItem[];
  userSelectOptions: SelectOption[];
  rbacLoading: boolean;
  rbacError: string | null;
  rbacSuccess: string | null;
  assignedUsers: import("../actions/authActions").RoleAssignedUsers[];
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  forgotEmail: null,
  otpSent: false,
  otpVerified: false,
  forgotLoading: false,
  otpLoading: false,
  resetLoading: false,
  forgotError: null,
  otpError: null,
  resetError: null,
  forgotSuccess: null,
  otpSuccess: null,
  resetSuccess: null,
  access: null,
  allRoles: [],
  allPermissions: [],
  userSelectOptions: [],
  assignedUsers: [],
  rbacLoading: false,
  rbacError: null,
  rbacSuccess: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.access = null;
      state.forgotEmail = null;
      state.otpSent = false;
      state.otpVerified = false;
      state.forgotLoading = false;
      state.otpLoading = false;
      state.resetLoading = false;
      state.forgotError = null;
      state.otpError = null;
      state.resetError = null;
      state.forgotSuccess = null;
      state.otpSuccess = null;
      state.resetSuccess = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    clearForgotState: (state) => {
      state.forgotEmail = null;
      state.otpSent = false;
      state.otpVerified = false;
      state.forgotLoading = false;
      state.otpLoading = false;
      state.resetLoading = false;
      state.forgotError = null;
      state.otpError = null;
      state.resetError = null;
      state.forgotSuccess = null;
      state.otpSuccess = null;
      state.resetSuccess = null;
    },
    clearRbacError: (state) => {
      state.rbacError = null;
    },
    clearRbacSuccess: (state) => {
      state.rbacSuccess = null;
    },
  },
  extraReducers: (builder) => {
    // ── Legacy Auth ──────────────────────────────────────────────────────────────
    builder.addCase(signup.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(signup.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      if (action.payload.data) {
        state.user = { id: action.payload.data.id, name: action.payload.data.name, email: action.payload.data.email, phone: action.payload.data.phone, tenantId: action.payload.data.tenantId, roles: action.payload.data.roles };
        state.token = action.payload.data.token || null;
      }
    });
    builder.addCase(signup.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      if (action.payload.data) {
        state.user = {
          id: action.payload.data.id,
          name: action.payload.data.name,
          email: action.payload.data.email,
          phone: action.payload.data.phone,
          tenantId: action.payload.data.tenantId,
          roles: action.payload.data.roles,
        };
        state.token = action.payload.data.token || null;
      }
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(forgotPassword.pending, (state) => {
      state.forgotLoading = true;
      state.forgotError = null;
      state.forgotSuccess = null;
    });
    builder.addCase(forgotPassword.fulfilled, (state, action) => {
      state.forgotLoading = false;
      state.forgotEmail = action.meta.arg.email;
      state.otpSent = true;
      state.forgotSuccess = action.payload?.message || "OTP sent to your email.";
    });
    builder.addCase(forgotPassword.rejected, (state, action) => {
      state.forgotLoading = false;
      state.forgotError = action.payload as string;
    });

    builder.addCase(verifyOtp.pending, (state) => {
      state.otpLoading = true;
      state.otpError = null;
      state.otpSuccess = null;
    });
    builder.addCase(verifyOtp.fulfilled, (state, action) => {
      state.otpLoading = false;
      state.otpVerified = true;
      state.otpSuccess = action.payload?.message || "OTP verified successfully.";
    });
    builder.addCase(verifyOtp.rejected, (state, action) => {
      state.otpLoading = false;
      state.otpError = action.payload as string;
    });

    builder.addCase(resetPassword.pending, (state) => {
      state.resetLoading = true;
      state.resetError = null;
      state.resetSuccess = null;
    });
    builder.addCase(resetPassword.fulfilled, (state, action) => {
      state.resetLoading = false;
      state.resetSuccess = action.payload?.message || "Password reset successfully.";
      state.otpVerified = false;
      state.otpSent = false;
    });
    builder.addCase(resetPassword.rejected, (state, action) => {
      state.resetLoading = false;
      state.resetError = action.payload as string;
    });

    // ── RBAC ──────────────────────────────────────────────────────────────────────
    builder.addCase(fetchMyAccess.pending, (state) => { state.rbacLoading = true; state.rbacError = null; });
    builder.addCase(fetchMyAccess.fulfilled, (state, action) => {
      state.rbacLoading = false;
      state.access = action.payload;
    });
    builder.addCase(fetchMyAccess.rejected, (state, action) => { state.rbacLoading = false; state.rbacError = action.payload as string; });

    builder.addCase(fetchAllRoles.pending, (state) => { state.rbacLoading = true; });
    builder.addCase(fetchAllRoles.fulfilled, (state, action) => { state.rbacLoading = false; state.allRoles = action.payload; });
    builder.addCase(fetchAllRoles.rejected, (state, action) => { state.rbacLoading = false; state.rbacError = action.payload as string; });

    builder.addCase(fetchAllPermissions.pending, (state) => { state.rbacLoading = true; });
    builder.addCase(fetchAllPermissions.fulfilled, (state, action) => { state.rbacLoading = false; state.allPermissions = action.payload; });
    builder.addCase(fetchAllPermissions.rejected, (state, action) => { state.rbacLoading = false; state.rbacError = action.payload as string; });

    builder.addCase(assignPermissionsToRole.pending, (state) => { state.rbacLoading = true; state.rbacError = null; });
    builder.addCase(assignPermissionsToRole.fulfilled, (state) => { state.rbacLoading = false; state.rbacSuccess = "Permissions assigned successfully"; });
    builder.addCase(assignPermissionsToRole.rejected, (state, action) => { state.rbacLoading = false; state.rbacError = action.payload as string; });

    builder.addCase(assignRoleToUser.pending, (state) => { state.rbacLoading = true; state.rbacError = null; });
    builder.addCase(assignRoleToUser.fulfilled, (state) => { state.rbacLoading = false; state.rbacSuccess = "Role assigned successfully"; });
    builder.addCase(assignRoleToUser.rejected, (state, action) => { state.rbacLoading = false; state.rbacError = action.payload as string; });

    builder.addCase(unassignRoleFromUser.pending, (state) => { state.rbacLoading = true; state.rbacError = null; });
    builder.addCase(unassignRoleFromUser.fulfilled, (state) => { state.rbacLoading = false; state.rbacSuccess = "Role unassigned successfully"; });
    builder.addCase(unassignRoleFromUser.rejected, (state, action) => { state.rbacLoading = false; state.rbacError = action.payload as string; });

    builder.addCase(transferRole.pending, (state) => { state.rbacLoading = true; state.rbacError = null; });
    builder.addCase(transferRole.fulfilled, (state) => { state.rbacLoading = false; state.rbacSuccess = "Role transferred successfully"; });
    builder.addCase(transferRole.rejected, (state, action) => { state.rbacLoading = false; state.rbacError = action.payload as string; });

    builder.addCase(fetchUserSelectOptions.fulfilled, (state, action) => { state.userSelectOptions = action.payload; });
    builder.addCase(fetchAssignedUsers.fulfilled, (state, action) => { state.assignedUsers = action.payload; });

    // createRole
    builder.addCase(createRole.pending, (state) => { state.rbacLoading = true; state.rbacError = null; });
    builder.addCase(createRole.fulfilled, (state, action) => {
      state.rbacLoading = false;
      state.allRoles = [...state.allRoles, action.payload];
      state.rbacSuccess = "Role created successfully";
    });
    builder.addCase(createRole.rejected, (state, action) => { state.rbacLoading = false; state.rbacError = action.payload as string; });
  },
});

export const { logout, clearError, clearForgotState, clearRbacError, clearRbacSuccess } = authSlice.actions;
export default authSlice.reducer;
