import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import adminReducer from "./slices/adminSlice";
import organizationReducer from "./actions/organizationActions";
import metaReducer from "./slices/metaSlice";
import settingsReducer from "./actions/settingsActions";
import departmentReducer from "./actions/departmentActions";
import designationReducer from "./actions/designationActions";
import onboardingReducer from "./actions/onboardingActions";
import attendanceReducer from "./actions/attendanceActions";
import leaveReducer from "./actions/leaveActions";
import payrollReducer from "./actions/payrollActions";
import feedReducer from "./slices/feedSlice";
import resignationReducer from "./actions/resignationActions";
import userReducer from "./actions/userActions";
import contactReducer from "./actions/contactActions";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    organization: organizationReducer,
    meta: metaReducer,
    settings: settingsReducer,
    departments: departmentReducer,
    designations: designationReducer,
    onboarding: onboardingReducer,
    attendance: attendanceReducer,
    leave: leaveReducer,
    payroll: payrollReducer,
    feed: feedReducer,
    resignation: resignationReducer,
    user: userReducer,
    contact: contactReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
