import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// ── Types ────────────────────────────────────────────────────────────────────

export interface FamilyMember {
  relation: string;
  name: string;
  dateOfBirth?: string | null;
  phone?: string | null;
  email?: string | null;
  occupation?: string | null;
  isDependent?: boolean;
}

export interface Qualification {
  degree: string;
  institution: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number;
  grade: string;
}

export interface Experience {
  companyName: string;
  jobTitle?: string | null;
  designation?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent?: boolean;
  description?: string | null;
  responsibilities?: string | null;
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  ifsc: string;
  accountHolderName: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  bloodGroup?: string | null;
  photoUrl?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pinCode?: string | null;
  panNumber?: string | null;
  aadhaarNumber?: string | null;
  bankDetails?: string | null;
  // Client-side parsed bank accounts (not sent directly to API)
  bankAccounts?: BankAccount[];
  familyMembers?: FamilyMember[];
  qualifications?: Qualification[];
  experiences?: Experience[];
  departmentId?: string | null;
  designationId?: string | null;
  department?: { id: string; name: string } | null;
  designation?: { id: string; name: string } | null;
  managerId?: string | null;
  manager?: { id: string; name: string; email: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileUpdatePayload {
  name?: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  bloodGroup?: string | null;
  photoUrl?: File | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pinCode?: string | null;
  panNumber?: string | null;
  aadhaarNumber?: string | null;
  bankDetails?: string | null;
}

export interface FamilyDetailsPayload {
  familyMembers: FamilyMember[];
}

export interface QualificationDetailsPayload {
  qualifications: Qualification[];
}

export interface ExperienceDetailsPayload {
  experiences: Experience[];
}

// ── State ─────────────────────────────────────────────────────────────────────

export interface UserState {
  profile: UserProfile | null;
  profileLoading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  profileLoading: false,
  saving: false,
  error: null,
};

// ── Auth helpers ─────────────────────────────────────────────────────────────

const getToken = (): string | null =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

const authHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// ── Thunks ───────────────────────────────────────────────────────────────────

// GET /users/details/{userId}
export const fetchUserProfile = createAsyncThunk<
  UserProfile,
  string,
  { rejectValue: string }
>(
  "user/fetchProfile",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/users/details/${userId}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch profile");
      const raw = data.data;
      const ep = raw.employeeProfile || {};
      return {
        id: raw.id,
        name: raw.name || '',
        email: raw.email || '',
        phone: raw.phone,
        dateOfBirth: ep.dateOfBirth,
        bloodGroup: ep.bloodGroup,
        photoUrl: ep.photoUrl,
        addressLine1: ep.addressLine1,
        addressLine2: ep.addressLine2,
        city: ep.city,
        state: ep.state,
        country: ep.country,
        pinCode: ep.pinCode,
        panNumber: ep.panNumber,
        aadhaarNumber: ep.aadharNumber,
        bankDetails: ep.bankAccount,
        familyMembers: ep.familyMembers || [],
        qualifications: ep.qualifications || [],
        experiences: ep.experiences || [],
        departmentId: ep.departmentId,
        designationId: ep.designationId,
        department: raw.department,
        designation: raw.designation,
        managerId: raw.managerId,
        manager: raw.manager,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      };
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// PUT /users/update (multipart/form-data for photo)
export const updateUserProfile = createAsyncThunk<
  UserProfile,
  ProfileUpdatePayload,
  { rejectValue: string }
>(
  "user/updateProfile",
  async (payload, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      if (payload.name !== undefined) formData.append("name", payload.name);
      if (payload.phone !== undefined) formData.append("phone", payload.phone ?? "");
      if (payload.dateOfBirth !== undefined) formData.append("dateOfBirth", payload.dateOfBirth ?? "");
      if (payload.bloodGroup !== undefined) formData.append("bloodGroup", payload.bloodGroup ?? "");
      if (payload.addressLine1 !== undefined) formData.append("addressLine1", payload.addressLine1 ?? "");
      if (payload.addressLine2 !== undefined) formData.append("addressLine2", payload.addressLine2 ?? "");
      if (payload.city !== undefined) formData.append("city", payload.city ?? "");
      if (payload.state !== undefined) formData.append("state", payload.state ?? "");
      if (payload.country !== undefined) formData.append("country", payload.country ?? "");
      if (payload.pinCode !== undefined) formData.append("pinCode", payload.pinCode ?? "");
      if (payload.panNumber !== undefined) formData.append("panNumber", payload.panNumber ?? "");
      if (payload.aadhaarNumber !== undefined) formData.append("aadhaarNumber", payload.aadhaarNumber ?? "");
      if (payload.bankDetails !== undefined) formData.append("bankDetails", payload.bankDetails ?? "");
      if (payload.photoUrl) formData.append("photoUrl", payload.photoUrl);

      const token = getToken();
      const res = await fetch(`${BASE}/org/users/update`, {
        method: "PUT",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to update profile");
      return data.data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// PUT /users/family-details
export const updateFamilyDetails = createAsyncThunk<
  FamilyMember[],
  FamilyMember[],
  { rejectValue: string }
>(
  "user/updateFamilyDetails",
  async (familyMembers, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/users/family-details`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ familyMembers }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to update family details");
      return data.data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// PUT /users/qualification-details
export const updateQualificationDetails = createAsyncThunk<
  Qualification[],
  Qualification[],
  { rejectValue: string }
>(
  "user/updateQualificationDetails",
  async (qualifications, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/users/qualification-details`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ qualifications }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to update qualifications");
      return data.data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// PUT /users/experience-details
export const updateExperienceDetails = createAsyncThunk<
  Experience[],
  Experience[],
  { rejectValue: string }
>(
  "user/updateExperienceDetails",
  async (experiences, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/users/experience-details`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ experiences }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to update experience");
      return data.data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserError: (state) => { state.error = null; },
    updateLocalProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // fetchUserProfile
    builder.addCase(fetchUserProfile.pending, (state) => {
      state.profileLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUserProfile.fulfilled, (state, action) => {
      state.profileLoading = false;
      state.profile = action.payload;
    });
    builder.addCase(fetchUserProfile.rejected, (state, action) => {
      state.profileLoading = false;
      state.error = action.payload as string;
    });

    // updateUserProfile
    builder.addCase(updateUserProfile.pending, (state) => {
      state.saving = true;
      state.error = null;
    });
    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      state.saving = false;
      state.profile = action.payload;
    });
    builder.addCase(updateUserProfile.rejected, (state, action) => {
      state.saving = false;
      state.error = action.payload as string;
    });

    // updateFamilyDetails
    builder.addCase(updateFamilyDetails.pending, (state) => {
      state.saving = true;
      state.error = null;
    });
    builder.addCase(updateFamilyDetails.fulfilled, (state, action) => {
      state.saving = false;
      if (state.profile) state.profile.familyMembers = action.payload;
    });
    builder.addCase(updateFamilyDetails.rejected, (state, action) => {
      state.saving = false;
      state.error = action.payload as string;
    });

    // updateQualificationDetails
    builder.addCase(updateQualificationDetails.pending, (state) => {
      state.saving = true;
      state.error = null;
    });
    builder.addCase(updateQualificationDetails.fulfilled, (state, action) => {
      state.saving = false;
      if (state.profile) state.profile.qualifications = action.payload;
    });
    builder.addCase(updateQualificationDetails.rejected, (state, action) => {
      state.saving = false;
      state.error = action.payload as string;
    });

    // updateExperienceDetails
    builder.addCase(updateExperienceDetails.pending, (state) => {
      state.saving = true;
      state.error = null;
    });
    builder.addCase(updateExperienceDetails.fulfilled, (state, action) => {
      state.saving = false;
      if (state.profile) state.profile.experiences = action.payload;
    });
    builder.addCase(updateExperienceDetails.rejected, (state, action) => {
      state.saving = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearUserError, updateLocalProfile } = userSlice.actions;
export default userSlice.reducer;
