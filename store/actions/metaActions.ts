import { createAsyncThunk } from "@reduxjs/toolkit";

export interface Industry {
  id: string;
  name: string;
}

export interface Country {
  name: string;
  isoCode: string;
  flag: string;
  phonecode: string;
  currency: string;
  latitude: string;
  longitude: string;
  timezones: {
    zoneName: string;
    gmtOffset: number;
    gmtOffsetName: string;
    abbreviation: string;
    tzName: string;
  }[];
}

export interface State {
  name: string;
  isoCode: string;
  countryCode: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const fetchIndustries = createAsyncThunk<Industry[], void>(
  "meta/fetchIndustries",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/meta/industries`
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch industries");
      }

      // Handle various response formats
      let industries: any[] = [];
      if (Array.isArray(data)) {
        // Direct array of strings: ["IT", "Healthcare", ...]
        industries = data.map((item, index) =>
          typeof item === "string" ? { id: String(index), name: item } : item
        );
      } else if (Array.isArray(data?.data)) {
        // { data: ["IT", "Healthcare", ...] }
        industries = data.data.map((item: any, index: number) =>
          typeof item === "string" ? { id: String(index), name: item } : item
        );
      } else if (Array.isArray(data?.industries)) {
        // { industries: ["IT", "Healthcare", ...] }
        industries = data.industries.map((item: any, index: number) =>
          typeof item === "string" ? { id: String(index), name: item } : item
        );
      }

      return industries;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const fetchCountries = createAsyncThunk<Country[], void>(
  "meta/fetchCountries",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/meta/countries`
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch countries");
      }

      // Handle various response formats
      if (Array.isArray(data)) {
        return data;
      } else if (Array.isArray(data?.data)) {
        return data.data;
      } else if (Array.isArray(data?.countries)) {
        return data.countries;
      }

      return [];
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const fetchCurrencies = createAsyncThunk<Currency[], void>(
  "meta/fetchCurrencies",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/meta/currencies`
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch currencies");
      }

      if (Array.isArray(data)) {
        return data;
      } else if (Array.isArray(data?.data)) {
        return data.data;
      } else if (Array.isArray(data?.currencies)) {
        return data.currencies;
      }

      return [];
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

export const fetchStates = createAsyncThunk<State[], string>(
  "meta/fetchStates",
  async (countryCode, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/meta/states/${countryCode}`
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch states");
      }

      // Handle various response formats
      if (Array.isArray(data)) {
        return data;
      } else if (Array.isArray(data?.data)) {
        return data.data;
      } else if (Array.isArray(data?.states)) {
        return data.states;
      }

      return [];
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);
