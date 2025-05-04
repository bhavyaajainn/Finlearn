import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  User as FirebaseUser,
  onAuthStateChanged,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '@/firebase';

// Types
type SerializableUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  phoneNumber: string | null;
};

type AuthState = {
  user: SerializableUser | null;
  loading: boolean;
  error: string | null;
  verificationEmailSent: boolean;
};

// Helper function to create a serializable user object
const createSerializableUser = (user: FirebaseUser | null) => {
  if (!user) return null;
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    phoneNumber: user.phoneNumber,
    // Add any other serializable properties you need
  };
};

// Initial state
const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
  verificationEmailSent: false
};

// Async thunks
export const signInWithEmail = createAsyncThunk(
  'auth/signInWithEmail',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Uncomment this section if you want to require email verification before login
      // if (!userCredential.user.emailVerified) {
      //   // Option 1: Block login until email is verified
      //   return rejectWithValue("Please verify your email before signing in.");
      //   
      //   // Option 2: Allow login but send another verification email
      //   // await sendEmailVerification(userCredential.user);
      // }
      
      return createSerializableUser(userCredential.user);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signUpWithEmail = createAsyncThunk(
  'auth/signUpWithEmail',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      return {
        user: createSerializableUser(userCredential.user),
        verificationEmailSent: true
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      return createSerializableUser(userCredential.user);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await firebaseSignOut(auth);
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkAuthState = createAsyncThunk(
  'auth/checkAuthState',
  async (_, { dispatch }) => {
    return new Promise<any>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(createSerializableUser(user));
      });
    });
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<FirebaseUser | null>) => {
      state.user = action.payload;
      state.loading = false;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearVerificationStatus: (state) => {
      state.verificationEmailSent = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Check auth state
      .addCase(checkAuthState.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthState.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      // Sign in with email
      .addCase(signInWithEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInWithEmail.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(signInWithEmail.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      // Sign up with email
      .addCase(signUpWithEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.verificationEmailSent = false;
      })
      .addCase(signUpWithEmail.fulfilled, (state, action) => {
        if (action.payload.user) {
          state.user = action.payload.user;
        }
        state.verificationEmailSent = action.payload.verificationEmailSent;
        state.loading = false;
      })
      .addCase(signUpWithEmail.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      // Sign in with Google
      .addCase(signInWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      // Sign out
      .addCase(signOut.pending, (state) => {
        state.loading = true;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      });
  },
});

export const { setUser, setError, clearError, clearVerificationStatus } = authSlice.actions;
export default authSlice.reducer;