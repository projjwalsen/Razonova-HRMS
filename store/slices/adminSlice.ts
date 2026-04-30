import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchDashboardKPIs,
  fetchCompanyDashboardKPIs,
  fetchOrganizations,
  fetchPendingOrganizations,
  approveOrganization,
  rejectOrganization,
  fetchPlatformUsers,
  fetchSubscriptionModules,
  upsertSubscriptionModule,
  fetchSubscribedTenants,
  fetchActiveSubscription,
  assignModulesToTenant,
  updateTenantModules,
  cancelSubscription,
  DashboardKPIs,
  CompanyDashboardKPIs,
  Organization,
  OrgUsersResponse,
  SubscriptionModule,
  SubscribedTenant,
  ActiveSubscription,
} from "../actions/adminActions";

interface AdminState {
  dashboardKPIs: DashboardKPIs | null;
  companyDashboardKPIs: CompanyDashboardKPIs | null;
  organizations: Organization[];
  pendingOrganizations: Organization[];
  orgUsers: OrgUsersResponse[];
  subscriptionModules: SubscriptionModule[];
  subscribedTenants: SubscribedTenant[];
  activeSubscription: ActiveSubscription | null;
  kpiLoading: boolean;
  kpiError: string | null;
  orgLoading: boolean;
  orgError: string | null;
  pendingLoading: boolean;
  pendingError: string | null;
  usersLoading: boolean;
  usersError: string | null;
  modulesLoading: boolean;
  modulesError: string | null;
  subscriptionLoading: boolean;
  subscriptionError: string | null;
  actionLoading: boolean;
  actionError: string | null;
  actionSuccess: string | null;
}

const initialState: AdminState = {
  dashboardKPIs: null,
  companyDashboardKPIs: null,
  organizations: [],
  pendingOrganizations: [],
  orgUsers: [],
  subscriptionModules: [],
  subscribedTenants: [],
  activeSubscription: null,
  kpiLoading: false,
  kpiError: null,
  orgLoading: false,
  orgError: null,
  pendingLoading: false,
  pendingError: null,
  usersLoading: false,
  usersError: null,
  modulesLoading: false,
  modulesError: null,
  subscriptionLoading: false,
  subscriptionError: null,
  actionLoading: false,
  actionError: null,
  actionSuccess: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.kpiError = null;
      state.orgError = null;
      state.pendingError = null;
      state.actionError = null;
      state.modulesError = null;
      state.subscriptionError = null;
    },
    clearAdminSuccess: (state) => {
      state.actionSuccess = null;
    },
    clearActiveSubscription: (state) => {
      state.activeSubscription = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Platform Dashboard KPIs
    builder.addCase(fetchDashboardKPIs.pending, (state) => {
      state.kpiLoading = true;
      state.kpiError = null;
    });
    builder.addCase(fetchDashboardKPIs.fulfilled, (state, action) => {
      state.kpiLoading = false;
      state.dashboardKPIs = action.payload;
    });
    builder.addCase(fetchDashboardKPIs.rejected, (state, action) => {
      state.kpiLoading = false;
      state.kpiError = action.payload as string;
    });

    // Fetch Company Dashboard KPIs
    builder.addCase(fetchCompanyDashboardKPIs.pending, (state) => {
      state.kpiLoading = true;
      state.kpiError = null;
    });
    builder.addCase(fetchCompanyDashboardKPIs.fulfilled, (state, action) => {
      state.kpiLoading = false;
      state.companyDashboardKPIs = action.payload;
    });
    builder.addCase(fetchCompanyDashboardKPIs.rejected, (state, action) => {
      state.kpiLoading = false;
      state.kpiError = action.payload as string;
    });

    // Fetch Organizations
    builder.addCase(fetchOrganizations.pending, (state) => {
      state.orgLoading = true;
      state.orgError = null;
    });
    builder.addCase(fetchOrganizations.fulfilled, (state, action) => {
      state.orgLoading = false;
      state.organizations = action.payload;
    });
    builder.addCase(fetchOrganizations.rejected, (state, action) => {
      state.orgLoading = false;
      state.orgError = action.payload as string;
    });

    // Fetch Pending Organizations
    builder.addCase(fetchPendingOrganizations.pending, (state) => {
      state.pendingLoading = true;
      state.pendingError = null;
    });
    builder.addCase(fetchPendingOrganizations.fulfilled, (state, action) => {
      state.pendingLoading = false;
      state.pendingOrganizations = action.payload;
    });
    builder.addCase(fetchPendingOrganizations.rejected, (state, action) => {
      state.pendingLoading = false;
      state.pendingError = action.payload as string;
    });

    // Approve Organization
    builder.addCase(approveOrganization.pending, (state) => {
      state.actionLoading = true;
      state.actionError = null;
      state.actionSuccess = null;
    });
    builder.addCase(approveOrganization.fulfilled, (state, action) => {
      state.actionLoading = false;
      state.actionSuccess = "Organization approved successfully";
      state.pendingOrganizations = state.pendingOrganizations.filter(
        (org) => org.id !== action.payload
      );
    });
    builder.addCase(approveOrganization.rejected, (state, action) => {
      state.actionLoading = false;
      state.actionError = action.payload as string;
    });

    // Reject Organization
    builder.addCase(rejectOrganization.pending, (state) => {
      state.actionLoading = true;
      state.actionError = null;
      state.actionSuccess = null;
    });
    builder.addCase(rejectOrganization.fulfilled, (state, action) => {
      state.actionLoading = false;
      state.actionSuccess = "Organization rejected successfully";
      state.pendingOrganizations = state.pendingOrganizations.filter(
        (org) => org.id !== action.payload
      );
    });
    builder.addCase(rejectOrganization.rejected, (state, action) => {
      state.actionLoading = false;
      state.actionError = action.payload as string;
    });

    // Fetch Platform Users (grouped by company)
    builder.addCase(fetchPlatformUsers.pending, (state) => {
      state.usersLoading = true;
      state.usersError = null;
    });
    builder.addCase(fetchPlatformUsers.fulfilled, (state, action) => {
      state.usersLoading = false;
      state.orgUsers = action.payload;
    });
    builder.addCase(fetchPlatformUsers.rejected, (state, action) => {
      state.usersLoading = false;
      state.usersError = action.payload as string;
    });

    // Fetch Subscription Modules
    builder.addCase(fetchSubscriptionModules.pending, (state) => {
      state.modulesLoading = true;
      state.modulesError = null;
    });
    builder.addCase(fetchSubscriptionModules.fulfilled, (state, action) => {
      state.modulesLoading = false;
      state.subscriptionModules = action.payload;
    });
    builder.addCase(fetchSubscriptionModules.rejected, (state, action) => {
      state.modulesLoading = false;
      state.modulesError = action.payload as string;
    });

    // Upsert Subscription Module
    builder.addCase(upsertSubscriptionModule.pending, (state) => {
      state.actionLoading = true;
      state.actionError = null;
      state.actionSuccess = null;
    });
    builder.addCase(upsertSubscriptionModule.fulfilled, (state, action) => {
      state.actionLoading = false;
      state.actionSuccess = "Module saved successfully";
      const index = state.subscriptionModules.findIndex(m => m.key === action.payload.key);
      if (index >= 0) {
        state.subscriptionModules[index] = action.payload;
      } else {
        state.subscriptionModules.push(action.payload);
      }
    });
    builder.addCase(upsertSubscriptionModule.rejected, (state, action) => {
      state.actionLoading = false;
      state.actionError = action.payload as string;
    });

    // Fetch Subscribed Tenants
    builder.addCase(fetchSubscribedTenants.pending, (state) => {
      state.subscriptionLoading = true;
      state.subscriptionError = null;
    });
    builder.addCase(fetchSubscribedTenants.fulfilled, (state, action) => {
      state.subscriptionLoading = false;
      state.subscribedTenants = action.payload;
    });
    builder.addCase(fetchSubscribedTenants.rejected, (state, action) => {
      state.subscriptionLoading = false;
      state.subscriptionError = action.payload as string;
    });

    // Fetch Active Subscription
    builder.addCase(fetchActiveSubscription.pending, (state) => {
      state.subscriptionLoading = true;
      state.subscriptionError = null;
    });
    builder.addCase(fetchActiveSubscription.fulfilled, (state, action) => {
      state.subscriptionLoading = false;
      state.activeSubscription = action.payload;
    });
    builder.addCase(fetchActiveSubscription.rejected, (state, action) => {
      state.subscriptionLoading = false;
      state.subscriptionError = action.payload as string;
    });

    // Assign Modules to Tenant
    builder.addCase(assignModulesToTenant.pending, (state) => {
      state.actionLoading = true;
      state.actionError = null;
      state.actionSuccess = null;
    });
    builder.addCase(assignModulesToTenant.fulfilled, (state) => {
      state.actionLoading = false;
      state.actionSuccess = "Modules assigned successfully";
    });
    builder.addCase(assignModulesToTenant.rejected, (state, action) => {
      state.actionLoading = false;
      state.actionError = action.payload as string;
    });

    // Update Tenant Modules
    builder.addCase(updateTenantModules.pending, (state) => {
      state.actionLoading = true;
      state.actionError = null;
      state.actionSuccess = null;
    });
    builder.addCase(updateTenantModules.fulfilled, (state) => {
      state.actionLoading = false;
      state.actionSuccess = "Modules updated successfully";
    });
    builder.addCase(updateTenantModules.rejected, (state, action) => {
      state.actionLoading = false;
      state.actionError = action.payload as string;
    });

    // Cancel Subscription
    builder.addCase(cancelSubscription.pending, (state) => {
      state.actionLoading = true;
      state.actionError = null;
      state.actionSuccess = null;
    });
    builder.addCase(cancelSubscription.fulfilled, (state, action) => {
      state.actionLoading = false;
      state.actionSuccess = "Subscription cancelled successfully";
      state.subscribedTenants = state.subscribedTenants.filter(
        (t) => !(t.tenantId === action.payload.tenantId && t.subscriptionId === action.payload.subscriptionId)
      );
    });
    builder.addCase(cancelSubscription.rejected, (state, action) => {
      state.actionLoading = false;
      state.actionError = action.payload as string;
    });
  },
});

export const { clearAdminError, clearAdminSuccess, clearActiveSubscription } = adminSlice.actions;
export default adminSlice.reducer;
