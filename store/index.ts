import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import organizationReducer from "./actions/organizationActions";
import metaReducer from "./slices/metaSlice";
import settingsReducer from "./actions/settingsActions";
import departmentReducer from "./actions/departmentActions";
import designationReducer from "./actions/designationActions";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    organization: organizationReducer,
    meta: metaReducer,
    settings: settingsReducer,
    departments: departmentReducer,
    designations: designationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
