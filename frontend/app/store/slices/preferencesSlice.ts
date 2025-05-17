import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'sonner';

// Define the interface for user preferences
export interface UserPreferences {
  expertise_level: string;
  categories: string[];
}

// Define the state interface
interface PreferencesState {
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: PreferencesState = {
  preferences: null,
  loading: false,
  error: null,
};

// Async thunk for fetching user preferences
export const fetchUserPreferences = createAsyncThunk(
  'preferences/fetchUserPreferences',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`https://finlearn.onrender.com/selectedcategories?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || 'Failed to fetch preferences');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for saving user preferences
export const saveUserPreferences = createAsyncThunk(
  'preferences/saveUserPreferences',
  async ({ userId, data }: { userId: string; data: UserPreferences }, { rejectWithValue }) => {
    try {
      const response = await fetch(`https://finlearn.onrender.com/selectedcategories?user_id=${userId}`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || 'Failed to save preferences');
      }

      const responseData = await response.json();
      return responseData;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating user preferences
export const updateUserPreferences = createAsyncThunk(
  'preferences/updateUserPreferences',
  async ({ userId, data }: { userId: string; data: UserPreferences }, { rejectWithValue }) => {
    try {
      const response = await fetch(`https://finlearn.onrender.com/selectedcategories?user_id=${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || 'Failed to update preferences');
      }

      const responseData = await response.json();
      return responseData;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Create the preferences slice
const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    clearPreferences: (state) => {
      state.preferences = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user preferences cases
      .addCase(fetchUserPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload;
      })
      .addCase(fetchUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Save user preferences cases
      .addCase(saveUserPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload;
      })
      .addCase(saveUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update user preferences cases
      .addCase(updateUserPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload;
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPreferences } = preferencesSlice.actions;
export default preferencesSlice.reducer;