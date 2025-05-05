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

const createSerializableUser = (user: FirebaseUser | null): SerializableUser | null => {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    phoneNumber: user.phoneNumber,
  };
};

// Session Storage Helpers
const SESSION_STORAGE_KEY = 'finlearn_user';

const saveUserToSessionStorage = (user: SerializableUser | null) => {
  if (user) {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }
};

const getUserFromSessionStorage = (): SerializableUser | null => {
  if (typeof window === "undefined") return null;

  const storedUser = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }
  return null;
};

const initialState: AuthState = {
  user: getUserFromSessionStorage(),
  loading: true,
  error: null,
  verificationEmailSent: false,
};

// Clear session storage when tab/window is closed
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  });
}

export const signInWithEmail = createAsyncThunk(
  'auth/signInWithEmail',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if the user's email is verified
      if (!userCredential.user.emailVerified) {
        // If email is not verified, send a new verification email and return an error
        await sendEmailVerification(userCredential.user);
        return rejectWithValue('email-not-verified');
      }
      
      const serializableUser = createSerializableUser(userCredential.user);
      saveUserToSessionStorage(serializableUser);
      return serializableUser;
    } catch (error: any) {
      // Extract the error code for better error handling in the UI
      const errorCode = error.code || '';
      return rejectWithValue(errorCode);
    }
  }
);

export const signUpWithEmail = createAsyncThunk(
  'auth/signUpWithEmail',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      const serializableUser = createSerializableUser(userCredential.user);
      saveUserToSessionStorage(serializableUser);
      return {
        user: serializableUser,
        verificationEmailSent: true,
      };
    } catch (error: any) {
      // Extract the error code for better error handling in the UI
      const errorCode = error.code || '';
      return rejectWithValue(errorCode);
    }
  }
);

export const resendVerificationEmail = createAsyncThunk(
  'auth/resendVerificationEmail',
  async (_, { getState, rejectWithValue }) => {
    try {
      // Check if user exists in Redux store
      const { auth: authState } = getState() as { auth: AuthState };
      if (!authState.user) {
        return rejectWithValue('no-user-logged-in');
      }
      
      // Get the current Firebase user
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        return rejectWithValue('user-not-found');
      }
      
      // Send the verification email
      await sendEmailVerification(firebaseUser);
      return true;
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
      const serializableUser = createSerializableUser(userCredential.user);
      saveUserToSessionStorage(serializableUser);
      return serializableUser;
    } catch (error: any) {
      // Extract the error code for better error handling in the UI
      const errorCode = error.code || '';
      return rejectWithValue(errorCode);
    }
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await firebaseSignOut(auth);
      saveUserToSessionStorage(null);
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkAuthState = createAsyncThunk(
  'auth/checkAuthState',
  async () => {
    return new Promise<SerializableUser | null>((resolve) => {
      const sessionUser = getUserFromSessionStorage();
      if (sessionUser) {
        resolve(sessionUser);
        return;
      }

      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        const serializableUser = createSerializableUser(user);
        saveUserToSessionStorage(serializableUser);
        resolve(serializableUser);
      });
    });
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<FirebaseUser | null>) => {
      state.user = createSerializableUser(action.payload);
      state.loading = false;
      saveUserToSessionStorage(state.user);
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearVerificationStatus: (state) => {
      state.verificationEmailSent = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuthState.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthState.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
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
        if (action.payload === 'email-not-verified') {
          state.verificationEmailSent = true;
        }
      })
      .addCase(signUpWithEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.verificationEmailSent = false;
      })
      .addCase(signUpWithEmail.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.verificationEmailSent = action.payload.verificationEmailSent;
        state.loading = false;
      })
      .addCase(signUpWithEmail.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      .addCase(resendVerificationEmail.fulfilled, (state) => {
        state.verificationEmailSent = true;
      })
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