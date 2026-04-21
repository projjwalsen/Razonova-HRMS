import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { signup, login, User, CurrentAccess, RoleSummary, PermissionItem, SelectOption } from "../actions/authActions";
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
  user: null, token: null, loading: false, error: null,
  access: null, allRoles: [], allPermissions: [], userSelectOptions: [], assignedUsers: [],
  rbacLoading: false, rbacError: null, rbacSuccess: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null; state.token = null; state.error = null; state.access = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token"); localStorage.removeItem("user");
      }
    },
    clearError: (state) => { state.error = null; },
    clearRbacError: (state) => { state.rbacError = null; },
    clearRbacSuccess: (state) => { state.rbacSuccess = null; },
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

    builder.addCase(login.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      if (action.payload.data) {
        state.user = { id: action.payload.data.id, name: action.payload.data.name, email: action.payload.data.email, phone: action.payload.data.phone, tenantId: action.payload.data.tenantId, roles: action.payload.data.roles };
        state.token = action.payload.data.token || null;
      }
    });
    builder.addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

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

export const { logout, clearError, clearRbacError, clearRbacSuccess } = authSlice.actions;
export default authSlice.reducer;
