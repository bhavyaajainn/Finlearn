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


const createSerializableUser = (user: FirebaseUser | null) => {
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

// Helper functions for session storage
const saveUserToSessionStorage = (user: SerializableUser | null) => {
  if (user) {
    sessionStorage.setItem('finlearn_user', JSON.stringify(user));
  } else {
    sessionStorage.removeItem('finlearn_user');
  }
};

const getUserFromSessionStorage = (): SerializableUser | null => {
  const storedUser = sessionStorage.getItem('finlearn_user');
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error('Failed to parse user from session storage:', error);
      return null;
    }
  }
  return null;
};

const initialState: AuthState = {
  user: getUserFromSessionStorage(), // Initialize from session storage
  loading: true,
  error: null,
  verificationEmailSent: false
};


export const signInWithEmail = createAsyncThunk(
  'auth/signInWithEmail',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const serializableUser = createSerializableUser(userCredential.user);
      saveUserToSessionStorage(serializableUser); // Save to session storage
      return serializableUser;
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
      await sendEmailVerification(userCredential.user);
      const serializableUser = createSerializableUser(userCredential.user);
      saveUserToSessionStorage(serializableUser); // Save to session storage
      return {
        user: serializableUser,
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
      const serializableUser = createSerializableUser(userCredential.user);
      saveUserToSessionStorage(serializableUser); // Save to session storage
      return serializableUser;
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
      saveUserToSessionStorage(null); // Clear from session storage
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkAuthState = createAsyncThunk(
  'auth/checkAuthState',
  async (_, { dispatch }) => {
    return new Promise<SerializableUser | null>((resolve) => {
      // First check session storage for quick loading
      const sessionUser = getUserFromSessionStorage();
      if (sessionUser) {
        resolve(sessionUser);
        return;
      }

      // Then check Firebase auth state
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        const serializableUser = createSerializableUser(user);
        saveUserToSessionStorage(serializableUser); // Save to session storage
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
    }
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
      })
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