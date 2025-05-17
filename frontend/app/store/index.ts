import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import learningReducer from './slices/learningSlice';
import preferencesReducer from './slices/preferencesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    learning: learningReducer,
    preferences: preferencesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'auth/signInWithGoogle/pending',
          'auth/signInWithGoogle/fulfilled', 
          'auth/signInWithGoogle/rejected',
          'auth/signInWithEmail/pending',
          'auth/signInWithEmail/fulfilled',
          'auth/signInWithEmail/rejected',
          'auth/signUpWithEmail/pending',
          'auth/signUpWithEmail/fulfilled',
          'auth/signUpWithEmail/rejected',
          'auth/signOut/pending',
          'auth/signOut/fulfilled',
          'auth/signOut/rejected',
          'auth/checkAuthState/pending',
          'auth/checkAuthState/fulfilled',
          'auth/checkAuthState/rejected',
          'auth/resendVerificationEmail/pending',
          'auth/resendVerificationEmail/fulfilled', 
          'auth/resendVerificationEmail/rejected',
          'auth/setUser',
          'preferences/fetchUserPreferences/pending',
          'preferences/fetchUserPreferences/fulfilled',
          'preferences/fetchUserPreferences/rejected',
          'preferences/saveUserPreferences/pending',
          'preferences/saveUserPreferences/fulfilled',
          'preferences/saveUserPreferences/rejected',
          'preferences/updateUserPreferences/pending',
          'preferences/updateUserPreferences/fulfilled',
          'preferences/updateUserPreferences/rejected'
        ],
        ignoredPaths: ['auth.user'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;