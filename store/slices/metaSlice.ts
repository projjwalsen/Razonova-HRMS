import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchIndustries,
  fetchCountries,
  fetchStates,
  Industry,
  Country,
  State,
} from "@/store/actions/metaActions";

interface MetaState {
  industries: Industry[];
  countries: Country[];
  states: State[];
  loading: boolean;
  error: string | null;
}

const initialState: MetaState = {
  industries: [],
  countries: [],
  states: [],
  loading: false,
  error: null,
};

const metaSlice = createSlice({
  name: "meta",
  initialState,
  reducers: {
    clearMetaError: (state) => {
      state.error = null;
    },
    clearStates: (state) => {
      state.states = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch Industries
    builder.addCase(fetchIndustries.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchIndustries.fulfilled,
      (state, action: PayloadAction<Industry[]>) => {
        state.loading = false;
        state.industries = action.payload;
      }
    );
    builder.addCase(fetchIndustries.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Countries
    builder.addCase(fetchCountries.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchCountries.fulfilled,
      (state, action: PayloadAction<Country[]>) => {
        state.loading = false;
        state.countries = action.payload;
      }
    );
    builder.addCase(fetchCountries.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch States
    builder.addCase(fetchStates.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchStates.fulfilled,
      (state, action: PayloadAction<State[]>) => {
        state.loading = false;
        state.states = action.payload;
      }
    );
    builder.addCase(fetchStates.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearMetaError, clearStates } = metaSlice.actions;
export default metaSlice.reducer;
